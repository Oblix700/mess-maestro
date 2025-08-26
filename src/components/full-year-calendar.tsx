
'use client';

import React from 'react';
import { cn, getDayOf28DayCycle } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MonthData {
  monthIndex: number;
  weeks: (Date | null)[][];
}

const generateCalendarForYear = (year: number): MonthData[] => {
  return MONTHS.map((_, monthIndex) => {
    const weeks: (Date | null)[][] = [];
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    let currentDate = new Date(firstDayOfMonth);
    // Adjust to start of the week (Monday)
    let dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Sunday is 0, make it 7
    currentDate.setDate(currentDate.getDate() - (dayOfWeek - 1));

    while (currentDate <= lastDayOfMonth || weeks.length < 6) {
      const week: (Date | null)[] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.getMonth() === monthIndex) {
          week.push(new Date(currentDate));
        } else {
          week.push(null);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      if (currentDate > lastDayOfMonth && weeks.length >= 6) break;
    }
    
    // Ensure all months have 6 rows for consistent layout
    while (weeks.length < 6) {
      weeks.push(Array(7).fill(null));
    }


    return { monthIndex, weeks };
  });
};

const MonthCalendar = ({ year, monthIndex, weeks }: { year: number; monthIndex: number; weeks: (Date | null)[][] }) => {
  return (
    <div className="w-full">
      <h3 className="font-bold text-center text-lg mb-2">{MONTHS[monthIndex]}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-muted-foreground mb-1">
        {DAYS_OF_WEEK.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-rows-6 gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              const isToday = date ? new Date().toDateString() === date.toDateString() : false;
              return (
                <div 
                  key={dayIndex} 
                  className={cn(
                    "h-16 w-full rounded-md p-1 flex flex-col justify-between text-xs border",
                    date ? 'bg-card' : 'bg-muted/50',
                    isToday && 'bg-primary text-primary-foreground'
                  )}
                >
                  {date && (
                    <>
                      <span className="font-bold text-sm self-start">{date.getDate()}</span>
                      <span className="font-mono self-end text-muted-foreground text-lg">{getDayOf28DayCycle(date)}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};


export const FullYearCalendar = ({ year }: { year: number }) => {
  const calendarData = generateCalendarForYear(year);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {calendarData.map(({ monthIndex, weeks }) => (
        <MonthCalendar key={monthIndex} year={year} monthIndex={monthIndex} weeks={weeks} />
      ))}
    </div>
  );
};
