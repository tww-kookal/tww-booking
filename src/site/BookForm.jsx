import AdultsDropdown from './AdultsDropdown';
import CheckIn from './CheckIn';
import CheckOut from './CheckOut';
import KidsDropdown from './KidsDropdown';

const BookForm = () => {

  const  handleCheck = (e) => {
    e.preventDefault();
  } ;

  return (
    <form className='h-[300px] lg:h-[70px] w-full'>
      <div className='flex flex-col w-full h-full lg:flex-row'>

        <div className='flex-1 border-r'>
          <CheckIn />
        </div>

        <div className='flex-1 border-r'>
          <CheckOut />
        </div>

        <div className='flex-1 border-r'>
          <AdultsDropdown />
        </div>

        <div className='flex-1 border-r'>
          <KidsDropdown />
        </div>

        <button
          type='submit'
          className='btn btn-primary'
          onClick={(e) => handleCheck(e)}
        >
          Check Now
        </button>

      </div>
    </form>
  );
};

export default BookForm;
