import React, { useState} from 'react';
import Room from './Room';

import { roomData } from './db/data';

const Rooms = () => {

  const [rooms, setRooms] = useState(roomData);

  return (
    <section className='py-24'>

      <div className='container mx-auto lg:px-0'>
        <div className='text-center'>
          <h2 className='font-primary text-[45px] mb-6'>Homes</h2>
        </div>

        <div className='grid grid-cols-1 max-w-sm mx-auto gap-[30px] lg:grid-cols-3 lg:max-w-none lg:mx-0'>
          {
            rooms.map(room =>
              <Room key={room.id} room={room} />
            )
          }
        </div>
      </div>

    </section>
  );
};

export default Rooms;
