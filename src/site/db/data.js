import { FaWifi, FaCoffee, FaBath, FaParking, FaSwimmingPool, FaHotdog, FaStopwatch, FaCocktail } from 'react-icons/fa';
import images from '../assets';

export const roomData = [
  {
    id: 1,
    name: 'Cedar',
    description:
      'A 180 degree panoramic view, to experience the woods while enjoying the warmth and cozy Swiss styled wooden home with a grand cathedral ceiling.',
    facilities: [
      { name: 'Wifi', icon: FaWifi },
      { name: 'Coffee', icon: FaCoffee },
      { name: 'Bath', icon: FaBath },
      { name: 'Parking Space', icon: FaParking },
      { name: 'Breakfast', icon: FaHotdog },
      { name: 'Drinks', icon: FaCocktail },
    ],
    size: 600,
    maxPerson: 8,
    price: 115,
    image: images.Cedar1Img,
    imageLg: images.Room1ImgLg,
  },
  {
    id: 2,
    name: 'Pine',
    description:
      'The signature equilateral triangle walls, ceilings, soaring windows immerse you in nature; wood-paneled walls warm the space, and mezzanine bedrooms are full of whimsy. It doesn’t matter where in the world you are—odds are, in an A-frame cabin, you’ll experience a heightened sense of luxury and convenience. ',
    facilities: [
      { name: 'Wifi', icon: FaWifi },
      { name: 'Coffee', icon: FaCoffee },
      { name: 'Bath', icon: FaBath },
      { name: 'Parking Space', icon: FaParking },
      { name: 'Breakfast', icon: FaHotdog },
      { name: 'Drinks', icon: FaCocktail },
    ],
    size: 600,
    maxPerson: 5,
    price: 220,
    image: images.Pine1Img,
    imageLg: images.Room2ImgLg,
  },
  {
    id: 3,
    name: 'Teak',
    description:
      'A simple twin room to accommodate couples with a mountain view direct from bed.',
    facilities: [
      { name: 'Wifi', icon: FaWifi },
      { name: 'Coffee', icon: FaCoffee },
      { name: 'Bath', icon: FaBath },
      { name: 'Parking Space', icon: FaParking },
      { name: 'Breakfast', icon: FaHotdog },
      { name: 'Drinks', icon: FaCocktail },
    ],
    size: 250,
    maxPerson: 3,
    price: 265,
    image: images.Teak1Img,
    imageLg: images.Room3ImgLg,
  },
  {
    id: 4,
    name: 'Maple',
    description:
      'The identical twin of Teak with a garden view right from the bed.',
    facilities: [
      { name: 'Wifi', icon: FaWifi },
      { name: 'Coffee', icon: FaCoffee },
      { name: 'Bath', icon: FaBath },
      { name: 'Parking Space', icon: FaParking },
      { name: 'Swimming Pool', icon: FaSwimmingPool },
      { name: 'Breakfast', icon: FaHotdog },
      { name: 'GYM', icon: FaStopwatch },
      { name: 'Drinks', icon: FaCocktail },
    ],
    size: 250,
    maxPerson: 3,
    price: 265,
    image: images.Maple1Img,
    imageLg: images.Room4ImgLg,
  },
  {
    id: 5,
    name: 'Tent',
    description:
      'For nature and adventure lovers, a cozy tent amidst the woods with a serenic jungle view',
    facilities: [
      { name: 'Wifi', icon: FaWifi },
      { name: 'Coffee', icon: FaCoffee },
      { name: 'Bath', icon: FaBath },
      { name: 'Parking Space', icon: FaParking },
      { name: 'Breakfast', icon: FaHotdog },
      { name: 'Drinks', icon: FaCocktail },
    ],
    size: 99,
    maxPerson: 2,
    price: 200,
    image: images.Tent1Img,
    imageLg: images.Room5ImgLg,
  },
];
