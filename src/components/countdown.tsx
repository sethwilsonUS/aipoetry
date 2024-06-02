"use client"

import { useState, useEffect } from "react";
import moment from "moment";

const Countdown: React.FC<{ttl: number}> = (props) =>{
  const [timeRemaining, setTimeRemaining] = useState(props.ttl)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          clearInterval(interval)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [props.ttl])
  return (
    <div className="w-full flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-900 dark:bg-gray-800 dark:text-gray-50">
      {timeRemaining > 0 ? (
        <>
          <ClockIcon className="h-5 w-5" />
          <span>{moment.utc(timeRemaining * 1000).format("mm:ss")}</span>
          <span>until next poem</span>
        </>
      ) : (
        <>
          <BookOpenIcon className="h-5 w-5" />
          <span>Refresh for new poem</span>
        </>
      )}
    </div>
  )
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export default Countdown;