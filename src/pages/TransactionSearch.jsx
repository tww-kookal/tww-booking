import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import TransactionList from "./TransactionList";
import { getAllAccountingCategories, getTransactionsSince, getTransactions } from '../modules/accounting.module';
import { getAllCustomers } from '../modules/customer.module';
import { getAllBookings } from '../modules/booking.module';
import '../css/transactionSearch.large.css';
import '../css/transactionSearch.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';
import { isUserInRoles } from "../contexts/constants";
import * as XLSX from 'xlsx';

const TransactionSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate } = useParams(); // startDate get form url (/transactions/search/:startDate) as string...
  const [searchCriteria, setSearchCriteria] = useState({
    transaction_date: startDate,
    transaction_end_date: startDate,
  });
  const [transactionsData, setTransactionsData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [bookingOptions, setBookingOptions] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState();

  const [allCustomers, setAllCustomers] = useState([]);
  const [accCategoryOptions, setAccCategoryOptions] = useState([]);
  const [accPartiesOptions, setAccPartiesOptions] = useState([])
  const [selectedAccCategory, setSelectedAccCategory] = useState();
  const [selectedPaidBy, setSelectedPaidBy] = useState();
  const [selectedTxnBy, setSelectedTxnBy] = useState();
  const [selectedReceivedBy, setSelectedReceivedBy] = useState();

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Reduced items per page for better mobile view

  useEffect(() => {
    getAllAccountingCategories(navigate).then(accCategories => {
      setAccCategoryOptions(accCategories.map(u => ({
        value: u.acc_category_id,
        label: `[${(u.acc_category_type || '#').charAt(0)}] ${u.acc_category_name}`
      })));
    }).catch(error => {
      console.error('Accounting::Error fetching acc categories:', error);
    });
  }, []);

  useEffect(() => {
    getAllCustomers(navigate).then(customers => {
      setAllCustomers(customers);
      setAccPartiesOptions(customers.map(u => ({
        value: u.customer_id,
        label: `${u.customer_name} - ${u.phone}`
      })));
    }).catch(error => {
      console.error('Accounting::Error fetching acc parties:', error);
    });
  }, []);

  useEffect(() => {
    getAllBookings(navigate, '2021-01-01').then(bookings => {
      //sort booking by booking id
      bookings = bookings.sort((a, b) => b.booking_id - a.booking_id);
      bookings = [{
        booking_id: 0,
        room_name: 'NO BOOKING',
        customer_name: '',
      }, ...bookings]
      setBookingOptions(bookings.map(u => ({
        value: u.booking_id,
        label: `${u.room_name} - ${u.customer_name} - [${u.booking_id}] `
      })));
    }).catch(error => {
      console.error('Accounting::Error fetching bookings:', error);
    });
  }, []);

  useEffect(() => {
    handleSearch(startDate);
  }, [startDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadExcel = () => {
    const excelData = transactionsData.map(transaction => ({
      'Transaction ID': transaction.acc_entry_id,
      'Date': dayjs(transaction.acc_entry_date).format('YYYY-MM-DD'),
      'Paid By ID': transaction.paid_by,
      'Paid By': transaction.paid_by_customer_name,
      'Paid By Phone': transaction.paid_by_customer_phone,
      'Received By ID': transaction.received_by,
      'Received By': transaction.received_by_customer_name,
      'Received By Phone': transaction.received_by_customer_phone,
      'Txn By ID': transaction.txn_by,
      'Txn By': transaction.txn_by_customer_name,
      'Txn By Phone': transaction.txn_by_customer_phone,
      'Account Category ID': transaction.acc_category_id,
      'Account Category': transaction.acc_category_name,
      'Amount': transaction.acc_entry_amount,
      'Description': transaction.acc_entry_description,
      'Credit/Debit': transaction.acc_category_type,
      'Mode': transaction.payment_type,
      'Booking ID': transaction.received_for_booking_id,
      'Guest Name': transaction.booking_customer_name,
      'Guest Phone': transaction.booking_customer_phone,
      'Room Name': transaction.room_name,
    }));
    if (!excelData.length) {
      toast.error('No transactions to download.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const calculateTotalDebitCredit = (transactions) => {
    //round of to two digits and comma seperated as currency
    const debit = transactions.filter(transaction => transaction.acc_category_type === 'debit').reduce((acc, transaction) => acc + transaction.acc_entry_amount, 0);
    setTotalDebit(Number(debit.toFixed(2)).toLocaleString());
    const credit = transactions.filter(transaction => transaction.acc_category_type === 'credit').reduce((acc, transaction) => acc + transaction.acc_entry_amount, 0);
    setTotalCredit(Number(credit.toFixed(2)).toLocaleString());
    setCurrentPage(1);
  }

  const validateSearchFields = (startDate) => {
    const { transaction_date, transaction_end_date } = searchCriteria;
    if (!startDate) return false;
    //if either the date is present then the next is mandatory
    if ((transaction_date && !transaction_end_date) || (!transaction_date && transaction_end_date)) {
      toast.error('Please select both dates.');
      return false;
    }
    if (transaction_end_date < transaction_date) {
      toast.error('End date must be above or equal to start date.');
      return false;
    }
    return true;
  }

  const handleSearch = (startDate) => {
    if (!validateSearchFields(startDate)) return;
    getTransactions(navigate, searchCriteria).then(transactions => {
      setTransactionsData(transactions);
      calculateTotalDebitCredit(transactions);
    }).catch(error => {
      console.error('Accounting::Error fetching transactions:', error);
    });
  };

  const handleCancel = () => {
    setSearchCriteria({});
    setSelectedAccCategory({
      value: 0,
      label: 'Select category...',
    });
    setSelectedPaidBy({
      value: 0,
      label: 'Select Payer...',
    });
    setSelectedTxnBy({
      value: 0,
      label: 'Transaction made by ...',
    });
    setSelectedReceivedBy({
      value: 0,
      label: 'Select Receiver...',
    });
    setSelectedBooking({
      value: 0,
      label: 'Select Booking ...',
    });
    setTransactionsData([]);
    setTotalDebit(0);
    setTotalCredit(0);
  }

  const handleViewTransaction = (selectedTransaction) => {
    if (selectedTransaction.acc_category_type === 'debit') {
      navigate(`/expenses`, {
        state: {
          preloadedExpense: selectedTransaction,
          from: 'searchExpense'
        }
      });
    }
  };

  const paginatedTransactions = transactionsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < Math.ceil(transactionsData.length / itemsPerPage)) setCurrentPage(currentPage + 1);
  };

  return (
    <div style={{ backgroundColor: 'black' }}>
      <ScrollToTop />
      <Swiper
        modules={[EffectFade, Autoplay]}
        effect={'fade'}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className='heroSlider h-[100px] lg:h-[27px]'
      ></Swiper>
      <ToastContainer />
      <div className="search-transaction-container" >
        <ToastContainer />
        <div className="search-header" >
          Search Transactions
        </div>

        <div className="search-form" >
          <div className="search-field" >
            <label htmlFor="acc_category_id">Account Category:</label>
            <Select name="acc_category_id"
              isDisabled={false}
              value={selectedAccCategory}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, acc_category_id: e.value }));
                setSelectedAccCategory({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accCategoryOptions}
              placeholder="Select category..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="transaction_date">From Date:</label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              value={searchCriteria.transaction_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="transaction_end_date">To Date:</label>
            <input
              type="date"
              id="transaction_end_date"
              name="transaction_end_date"
              value={searchCriteria.transaction_end_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="paid_by">Paid By:</label>
            <Select name="paid_by"
              isDisabled={false}
              value={selectedPaidBy}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, paid_by: e.value }));
                setSelectedPaidBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Select Payer..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="txn_by">Txn By</label>
            <Select name="txn_by"
              isDisabled={false}
              value={selectedTxnBy}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, txn_by: e.value }));
                setSelectedTxnBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Transaction made by ..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>


          <div className="search-field" >
            <label htmlFor="received_by">Received By:</label>
            <Select name="received_by"
              isDisabled={false}
              value={selectedReceivedBy}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, received_by: e.value }));
                setSelectedReceivedBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Select Receiver..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="booking_id">For Booking</label>
            <Select name="booking_id"
              value={selectedBooking}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, booking_id: e.value }));
                setSelectedBooking({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={bookingOptions}
              placeholder="Select booking ..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>

          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="searching-animation">
                Searching
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            ) : 'Search'}
          </button>
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
            style={{ width: '100%' }}
          >
            Cancel
          </button>
          {transactionsData.length > 0 && (
            <button
              className="download-button"
              onClick={handleDownloadExcel}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Download as Excel
            </button>
          )}
        </div>

        <TransactionList
          loading={loading}
          transactions={transactionsData}
          paginatedTransactions={paginatedTransactions}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          handleViewTransaction={handleViewTransaction}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
        />
      </div>
    </div>
  );
};

export default TransactionSearch;
