import React, { useState} from 'react';
import { BsCalendar } from 'react-icons/bs';

const CheckOut = () => {

  const [endDate, setEndDate] = useState(false);

  return (
    <div className='relative flex items-center justify-end h-full'>

      <div className='absolute z-10 pr-8'>
        <div><BsCalendar className='text-accent text-base' /> </div>
      </div>

      {/*       <DatePicker
        className='w-full h-full'
        selected={endDate}
        placeholderText='Check out'
        onChange={(date) => setEndDate(date)}
      />
 */}
      <input
        className='w-full h-full'
        type='date'
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

    </div>
  );
};

export default CheckOut;
