// SCORM requires time to be formatted in a specific way
// Code adapted from https://scorm.com/scorm-explained/technical-scorm/golf-examples/

function zeroPad(intNum, intNumDigits) {
  let strTemp = String(intNum);
  const intLen = strTemp.length;

  if (intLen > intNumDigits) {
    strTemp = strTemp.substr(0, intNumDigits);
  } else {
    for (let i = intLen; i < intNumDigits; i++) {
      strTemp = `0${strTemp}`;
    }
  }

  return strTemp;
}

// SCORM 1.2 Version
function milliSecToSCORM12Time(intTotalMilliseconds, blnIncludeFraction = true) {
  let intHours;
  let intMinutes;
  let intSeconds;
  let intMilliseconds;
  let strCMITimeSpan;

  // extract time parts
  intMilliseconds = intTotalMilliseconds % 1000;

  intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

  intMinutes = ((intTotalMilliseconds - intMilliseconds - intSeconds * 1000) / 60000) % 60;

  intHours =
    (intTotalMilliseconds - intMilliseconds - intSeconds * 1000 - intMinutes * 60000) / 3600000;

  /**
   * Deal with exceptional case when content used a huge amount of time and
   * interpreted CMITimstamp * to allow a number of intMinutes and seconds
   * greater than 60 i.e. * 9999:99:99.99 instead of 9999:60:60:99 note - this
   * case is permissable * under SCORM, but will be exceptionally rare
   */

  if (intHours === 10000) {
    intHours = 9999;
    intMinutes = (intTotalMilliseconds - intHours * 3600000) / 60000;
    if (intMinutes === 100) {
      intMinutes = 99;
    }
    intMinutes = Math.floor(intMinutes);

    intSeconds = (intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000) / 1000;
    if (intSeconds === 100) {
      intSeconds = 99;
    }
    intSeconds = Math.floor(intSeconds);

    intMilliseconds =
      intTotalMilliseconds - intHours * 3600000 - intMinutes * 60000 - intSeconds * 1000;
  }
  // drop the extra precision from the milliseconds
  const intHundredths = Math.floor(intMilliseconds / 10);

  // put in padding 0's and concatinate to get the proper format
  strCMITimeSpan = `${zeroPad(intHours, 4)}:${zeroPad(intMinutes, 2)}:${zeroPad(intSeconds, 2)}`;

  if (blnIncludeFraction) {
    strCMITimeSpan += `.${intHundredths}`;
  }

  // check for case where total milliseconds is greater than max supported by
  // strCMITimeSpan
  if (intHours > 9999) {
    strCMITimeSpan = '9999:99:99';

    if (blnIncludeFraction) {
      strCMITimeSpan += '.99';
    }
  }

  return strCMITimeSpan;
}

// SCORM 2004 Version
function milliSecToSCORM2004Time(intTotalMilliseconds) {
  let ScormTime = '';

  let Hundredths; // decrementing counter - work at the hundreths of a second level because that is all the precision that is required

  const HUNDREDTHS_PER_SECOND = 100;
  const HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
  const HUNDREDTHS_PER_HOUR = HUNDREDTHS_PER_MINUTE * 60;
  const HUNDREDTHS_PER_DAY = HUNDREDTHS_PER_HOUR * 24;
  const HUNDREDTHS_PER_MONTH = HUNDREDTHS_PER_DAY * ((365 * 4 + 1) / 48);
  const HUNDREDTHS_PER_YEAR = HUNDREDTHS_PER_MONTH * 12;

  const totalHundredths = Math.floor(intTotalMilliseconds / 10);
  Hundredths = totalHundredths;

  const Years = Math.floor(Hundredths / HUNDREDTHS_PER_YEAR);
  Hundredths -= Years * HUNDREDTHS_PER_YEAR;

  // assumed to be an "average" month (figures a leap year every 4 years)
  const Months = Math.floor(Hundredths / HUNDREDTHS_PER_MONTH);
  Hundredths -= Months * HUNDREDTHS_PER_MONTH;

  // = ((365*4) + 1) / 48 days - 30.4375 days per month
  const Days = Math.floor(Hundredths / HUNDREDTHS_PER_DAY);
  Hundredths -= Days * HUNDREDTHS_PER_DAY;

  const Hours = Math.floor(Hundredths / HUNDREDTHS_PER_HOUR);
  Hundredths -= Hours * HUNDREDTHS_PER_HOUR;

  const Minutes = Math.floor(Hundredths / HUNDREDTHS_PER_MINUTE);
  Hundredths -= Minutes * HUNDREDTHS_PER_MINUTE;

  const Seconds = Math.floor(Hundredths / HUNDREDTHS_PER_SECOND);
  Hundredths -= Seconds * HUNDREDTHS_PER_SECOND;

  if (Years > 0) {
    ScormTime += `${Years}Y`;
  }
  if (Months > 0) {
    ScormTime += `${Months}M`;
  }
  if (Days > 0) {
    ScormTime += `${Days}D`;
  }

  // check to see if we have any time before adding the "T"
  if (Hundredths + Seconds + Minutes + Hours > 0) {
    ScormTime += 'T';

    if (Hours > 0) {
      ScormTime += `${Hours}H`;
    }

    if (Minutes > 0) {
      ScormTime += `${Minutes}M`;
    }

    if (Hundredths + Seconds > 0) {
      ScormTime += Seconds;

      if (Hundredths > 0) {
        ScormTime += `.${Hundredths}`;
      }

      ScormTime += 'S';
    }
  }

  if (ScormTime === '') {
    ScormTime = 'T0S';
  }

  ScormTime = `P${ScormTime}`;

  return ScormTime;
}

export { milliSecToSCORM12Time, milliSecToSCORM2004Time };
