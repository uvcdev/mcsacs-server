import dayjs from 'dayjs';

export const calculateDurationInSeconds = (startDate: string | Date, endDate: string | Date) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const durationSec = end.diff(start, 'second');
  return durationSec;
};