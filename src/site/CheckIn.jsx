import React, { useState} from 'react';
import { BsCalendar } from 'react-icons/bs';

const CheckIn = () => {

  const [startDate, setStartDate] = useState(false);

  return (
    <div className='relative flex items-center justify-end h-full'>

      <div className='absolute z-10 pr-8'>
        <div><BsCalendar className='text-accent text-base' /> </div>
      </div>

{/*       <DatePicker
        className='w-full h-full'
        selected={startDate}
        placeholderText='Check in'
        onChange={(date) => setStartDate(date)}
      />
 */}
      <input
        className='w-full h-full'
        type='date'
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

    </div>
  );
};

export default CheckIn;
