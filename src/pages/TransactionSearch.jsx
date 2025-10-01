import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import TransactionList from "./TransactionList";
import { getAllAccountingCategories, getTransactionsSince } from '../modules/accounting.module';
import { getAllCustomers } from '../modules/customer.module';
import '../css/transactionSearch.large.css';
import '../css/transactionSearch.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const TransactionSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchCriteria, setSearchCriteria] = useState({
    transactionDate: dayjs().add(-1, 'day').format('YYYY-MM-DD'),
    paidBy: 0,
    txn_by: 0,
    acc_category_id: 0,
    receivedBy: 0,
    receivedForBookingId: 0,

  });
  const [transactions, setTransactions] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const [allCustomers, setAllCustomers] = useState([]);
  const [accCategoryOptions, setAccCategoryOptions] = useState([]);
  const [accPartiesOptions, setAccPartiesOptions] = useState([])
  const [selectedAccCategory, setSelectedAccCategory] = useState();
  const [selectedPaidBy, setSelectedPaidBy] = useState();
  const [selectedTxnBy, setSelectedTxnBy] = useState();
  const [selectedReceivedBy, setSelectedReceivedBy] = useState();

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced items per page for better mobile view

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTransactions = async (transactionsSince = dayjs().add(-1, 'day').format('YYYY-MM-DD')) => {
    setLoading(true);
    try {
      const allTransactions = await getTransactionsSince(navigate, transactionsSince);
      if (!allTransactions || allTransactions.length <= 0) {
        setTransactions([]);
        return;
      }
      setTransactions(allTransactions);
      //round of to two digits and comma seperated as currency
      const debit = allTransactions.filter(transaction => transaction.acc_category_type === 'debit').reduce((acc, transaction) => acc + transaction.acc_entry_amount, 0);
      setTotalDebit(Number(debit.toFixed(2)).toLocaleString());
      const credit = allTransactions.filter(transaction => transaction.acc_category_type === 'credit').reduce((acc, transaction) => acc + transaction.acc_entry_amount, 0);
      setTotalCredit(Number(credit.toFixed(2)).toLocaleString());
      setCurrentPage(1);
    } catch (err) {
      console.error("TransactionSearch::FetchTransactions::Error fetching data:", err);
      toast.error("Failed to fetch transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = () => {
    fetchTransactions(searchCriteria.transactionDate);
  };

  const handleViewTransaction = (selectedTransaction) => {
    navigate(`/transactions`, {
      state: {
        preloadedTransaction: selectedTransaction,
        from: 'searchTransaction'
      }
    });
  };

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < Math.ceil(transactions.length / itemsPerPage)) setCurrentPage(currentPage + 1);
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
            <label htmlFor="transactionDate">Transactions Since:</label>
            <input
              type="date"
              id="transactionDate"
              name="transactionDate"
              value={searchCriteria.transactionDate}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="paidBy">Paid By:</label>
            <Select name="paidBy"
              isDisabled={true}
              value={selectedPaidBy}
              onChange={e => {
                setTransaction(prev => ({ ...prev, paid_by: e.value }));
                setSelectedPaidBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Select Payer..."
              isSearchable={true}
              classNamePrefix="react-select"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="acc_category_id">Account Category:</label>
            <Select name="acc_category_id"
              isDisabled={true}
              value={selectedAccCategory}
              onChange={e => {
                setTransaction(prev => ({ ...prev, acc_category_id: e.value }));
                setSelectedAccCategory({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accCategoryOptions}
              placeholder="Select a acc category..."
              isSearchable={true}
              classNamePrefix="react-select"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="txn_by">Txn By</label>
            <Select name="txn_by"
              isDisabled={true}
              value={selectedTxnBy}
              onChange={e => {
                setTransaction(prev => ({ ...prev, txn_by: e.value }));
                setSelectedTxnBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Transaction made by ..."
              isSearchable={true}
              classNamePrefix="react-select"
            />
          </div>


          <div className="search-field" >
            <label htmlFor="receivedBy">Received By:</label>
            <Select name="received_by"
              isDisabled={true}
              value={selectedReceivedBy}
              onChange={e => {
                setTransaction(prev => ({ ...prev, received_by: e.value }));
                setSelectedReceivedBy({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={accPartiesOptions}
              placeholder="Select Receiver..."
              isSearchable={true}
              classNamePrefix="react-select"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="receivedForBookingId">Received For Booking ID:</label>
            <input
              disabled={true}
              type="text"
              id="receivedForBookingId"
              name="receivedForBookingId"
              placeholder="Enter received for booking ID"
              value={searchCriteria.receivedForBookingId}
              onChange={handleInputChange}
              style={{ width: '100%' }}
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
        </div>

        <TransactionList
          loading={loading}
          transactions={transactions}
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
