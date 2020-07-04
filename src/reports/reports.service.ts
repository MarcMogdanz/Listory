import { BadRequestException, Injectable } from "@nestjs/common";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfDay,
  formatISO,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  parseISO,
  parseJSON,
  startOfDay,
  sub,
} from "date-fns";
import { ListensService } from "../listens/listens.service";
import { GetListenReportDto } from "./dto/get-listen-report.dto";
import { ListenReportDto } from "./dto/listen-report.dto";
import { Timeframe } from "./timeframe.enum";
import { TimePreset } from "./timePreset.enum";

const timeframeToDateFns: {
  [x in Timeframe]: {
    eachOfInterval: (interval: Interval) => Date[];
    isSame: (dateLeft: Date, dateRight: Date) => boolean;
  };
} = {
  [Timeframe.Day]: {
    eachOfInterval: eachDayOfInterval,
    isSame: isSameDay,
  },
  [Timeframe.Week]: {
    eachOfInterval: eachWeekOfInterval,
    isSame: isSameWeek,
  },
  [Timeframe.Month]: {
    eachOfInterval: eachMonthOfInterval,
    isSame: isSameMonth,
  },
  [Timeframe.Year]: {
    eachOfInterval: eachYearOfInterval,
    isSame: isSameYear,
  },
};

const timePresetToDays: { [x in TimePreset]: number } = {
  [TimePreset.LAST_7_DAYS]: 7,
  [TimePreset.LAST_30_DAYS]: 30,
  [TimePreset.LAST_90_DAYS]: 90,
  [TimePreset.LAST_180_DAYS]: 180,
  [TimePreset.LAST_365_DAYS]: 365,
  [TimePreset.ALL_TIME]: 0, // Not used for this
  [TimePreset.CUSTOM]: 0, // Not used for this
};

@Injectable()
export class ReportsService {
  constructor(private readonly listensService: ListensService) {}

  async getListens(options: GetListenReportDto): Promise<ListenReportDto> {
    const { user, timeFrame, timeStart, timeEnd } = options;

    // Function should eventually be rewritten to accept a timepreset
    const interval = this.getIntervalFromPreset({
      timePreset: TimePreset.CUSTOM,
      customTimeStart: timeStart,
      customTimeEnd: timeEnd,
    });

    const { items: listens } = await this.listensService.getListens({
      user,
      filter: { time: interval },
      page: 1,
      limit: 10000000,
    });

    const reportInterval: Interval = {
      start: parseISO(timeStart),
      end: parseISO(timeEnd),
    };

    const { eachOfInterval, isSame } = timeframeToDateFns[timeFrame];

    const reportItems = eachOfInterval(reportInterval).map((date) => {
      const count = listens.filter((listen) => isSame(date, listen.playedAt))
        .length;
      return { date: formatISO(date), count };
    });

    return { items: reportItems, timeStart, timeEnd, timeFrame };
  }
  private getIntervalFromPreset(options: {
    timePreset: TimePreset;
    customTimeStart?: string;
    customTimeEnd?: string;
  }): Interval {
    let interval = {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()), // NOW
    };

    switch (options.timePreset) {
      case TimePreset.LAST_7_DAYS:
      case TimePreset.LAST_30_DAYS:
      case TimePreset.LAST_90_DAYS:
      case TimePreset.LAST_180_DAYS:
      case TimePreset.LAST_365_DAYS: {
        interval.start = startOfDay(
          sub(interval.start, { days: timePresetToDays[options.timePreset] })
        );
        break;
      }

      case TimePreset.ALL_TIME: {
        interval.start = new Date(0); // Start of epoch
        break;
      }

      case TimePreset.CUSTOM: {
        if (!options.customTimeStart && !options.customTimeEnd) {
          throw new BadRequestException("MissingCustomTime");
        }

        interval = {
          start: parseJSON(options.customTimeStart),
          end: parseJSON(options.customTimeEnd),
        };

        break;
      }
    }

    return interval;
  }
}