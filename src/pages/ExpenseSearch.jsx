import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import ExpenseList from "./ExpenseList";
import { getExpensesSince } from "../modules/expense.module";

import '../css/expenseSearch.large.css';
import '../css/expenseSearch.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const ExpenseSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchCriteria, setSearchCriteria] = useState({
    expenseDate: dayjs().add(-1, 'day').format('YYYY-MM-DD'),
    paidBy: 0,
    acc_category_id: 0,
    receivedBy: 0,
    receivedForBookingId: 0,

  });
  const [expenses, setExpenses] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced items per page for better mobile view

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const fetchExpenses = async (expensesSince = dayjs().add(-1, 'day').format('YYYY-MM-DD')) => {
    setLoading(true);
    try {
      const allExpenses = await getExpensesSince(navigate, expensesSince);
      if (!allExpenses || allExpenses.length <= 0) {
        setExpenses([]);
        return;
      }
      setExpenses(allExpenses);
      //round of to two digits and comma seperated as currency
      const debit = allExpenses.filter(expense => expense.acc_category_type === 'debit').reduce((acc, expense) => acc + expense.acc_entry_amount, 0);
      setTotalDebit(Number(debit.toFixed(2)).toLocaleString());
      const credit = allExpenses.filter(expense => expense.acc_category_type === 'credit').reduce((acc, expense) => acc + expense.acc_entry_amount, 0);
      setTotalCredit(Number(credit.toFixed(2)).toLocaleString());
      setCurrentPage(1);
    } catch (err) {
      console.error("ExpenseSearch::FetchExpenses::Error fetching data:", err);
      toast.error("Failed to fetch expenses. Please try again.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSearch = () => {
    fetchExpenses(searchCriteria.expenseDate);
  };

  const handleViewExpense = (selectedExpense) => {
    navigate(`/expenses`, {
      state: {
        preloadedExpense: selectedExpense,
        from: 'searchExpense'
      }
    });
  };

  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < Math.ceil(expenses.length / itemsPerPage)) setCurrentPage(currentPage + 1);
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
      <div className="search-expense-container" >
        <ToastContainer />
        <div className="search-header" >
          Search Expenses
        </div>

        <div className="search-form" >
          <div className="search-field" >
            <label htmlFor="expenseDate">Expense Date:</label>
            <input
              type="date"
              id="expenseDate"
              name="expenseDate"
              value={searchCriteria.expenseDate}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="paidBy">Paid By:</label>
            <input
              type="text"
              id="paidBy"
              name="paidBy"
              placeholder="Enter paid by"
              value={searchCriteria.paidBy}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="acc_category_id">Account Category:</label>
            <input
              type="text"
              id="acc_category_id"
              name="acc_category_id"
              placeholder="Enter account category"
              value={searchCriteria.acc_category_id}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="receivedBy">Received By:</label>
            <input
              type="text"
              id="receivedBy"
              name="receivedBy"
              placeholder="Enter received by"
              value={searchCriteria.receivedBy}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="receivedForBookingId">Received For Booking ID:</label>
            <input
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

        <ExpenseList
          loading={loading}
          expenses={expenses}
          paginatedExpenses={paginatedExpenses}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          handleViewExpense={handleViewExpense}
          totalDebit={totalDebit}
          totalCredit={totalCredit}
        />
      </div>
    </div>
  );
};

export default ExpenseSearch;
