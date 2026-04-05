export interface CalendarDayDto {
  readonly hasReservation: boolean;
  readonly status?: string;
}

export type CalendarDataDto = Record<string, CalendarDayDto>;
