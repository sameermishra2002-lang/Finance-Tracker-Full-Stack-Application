import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as api from '../../services/api'; 
import MoneyCash from '../../assets/money-cash.svg';
import MoneyGoing from '../../assets/money-going.svg';
import BalanceLeft from '../../assets/wallet.svg';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logoutUser, refreshUserData } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'transactions', or 'admin'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Admin panel states
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other']
  };

  // ========================================================================
  // FETCH TRANSACTIONS FROM BACKEND
  // ========================================================================
  
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getTransactions();
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions from database. Please check your connection.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch monthly trend data
  useEffect(() => {
    const fetchMonthlyTrend = async () => {
      try {
        setLoadingTrend(true);
        const currentYear = new Date().getFullYear();
        const trendData = await api.getMonthlyTrend(currentYear);
        setMonthlyTrendData(trendData || []);
      } catch (err) {
        console.error('Error fetching monthly trend:', err);
        setMonthlyTrendData([]);
      } finally {
        setLoadingTrend(false);
      }
    };
    fetchMonthlyTrend();
  }, []);

  // ========================================================================
  // ADMIN: FETCH ALL USERS
  // ========================================================================
  
  const fetchAllUsers = useCallback(async () => {
    if (user.role !== 'admin') return;
    
    try {
      setLoadingUsers(true);
      const response = await api.getAllUsers();
      setAllUsers(response.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Failed to load users. You may not have admin permissions.');
    } finally {
      setLoadingUsers(false);
    }
  }, [user.role]);

  // Fetch users when switching to admin view
  useEffect(() => {
    if (view === 'admin' && user.role === 'admin') {
      fetchAllUsers();
    }
  }, [view, user.role, fetchAllUsers]);

  // ========================================================================
  // ADMIN: UPDATE USER ROLE
  // ========================================================================
  
  const handleUpdateUserRole = useCallback(async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      
      // Update local state
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setShowRoleModal(false);
      setSelectedUser(null);
      
      // Refresh current user data if they changed their own role
      // or to ensure UI reflects any backend changes
      if (refreshUserData) {
        await refreshUserData();
      }
      
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  }, [refreshUserData]);

  const handleOpenRoleModal = useCallback((user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  }, []);

  // ========================================================================
  // OPTIMIZED CALCULATIONS WITH useMemo (prevents recalculation on every render)
  // ========================================================================
  
  // Calculate totals - only recalculates when transactions change
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  // Category-wise breakdown - memoized
  const categoryBreakdown = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});
  }, [transactions]);

  // Prepare data for Pie Chart
  const pieChartData = useMemo(() => {
    return Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        name: category,
        value: amount
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown]);

  // Prepare data for Bar Chart (Income vs Expense)
  const barChartData = useMemo(() => {
    return [
      { name: 'Income', amount: totalIncome, fill: '#10b981' },
      { name: 'Expenses', amount: totalExpense, fill: '#ef4444' }
    ];
  }, [totalIncome, totalExpense]);

  // Filter transactions - memoized
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, searchTerm]);

  // ========================================================================
  // OPTIMIZED EVENT HANDLERS WITH useCallback (prevents function recreation)
  // ========================================================================

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' && { category: categories[value][0] })
    }));
  }, [categories]);

const handleAmountChange = (e) => {
  const input = e.target;
  const selectionStart = input.selectionStart;

  const oldValue = input.value;

  // remove commas
  let rawValue = oldValue.replace(/,/g, '');

  // allow numbers + decimal
  if (!/^\d*\.?\d*$/.test(rawValue)) return;

  if (!rawValue) {
    setFormData(prev => ({ ...prev, amount: '' }));
    return;
  }

  const parts = rawValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ?? '';

  const formattedInteger = Number(integerPart).toLocaleString('en-IN');

  const formattedValue =
    decimalPart !== '' ? `${formattedInteger}.${decimalPart}` : formattedInteger;

  setFormData(prev => ({
    ...prev,
    amount: formattedValue
  }));

  // calculate cursor shift caused by commas
  const commasBefore = (oldValue.match(/,/g) || []).length;
  const commasAfter = (formattedValue.match(/,/g) || []).length;

  let newCursor = selectionStart + (commasAfter - commasBefore);

  // prevent cursor jumping to wrong position
  if (newCursor < 0) newCursor = 0;
  if (newCursor > formattedValue.length) newCursor = formattedValue.length;

  requestAnimationFrame(() => {
    input.setSelectionRange(newCursor, newCursor);
  });
};

  const handleAddTransaction = useCallback(async (e) => {
    e.preventDefault();
    
    if (user.role === 'read-only') {
      alert('Read-only users cannot add transactions');
      return;
    }

    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount.replace(/,/g, '')),
        description: formData.description,
        transaction_date: formData.date
      };

      const response = await api.createTransaction(transactionData);
      
      // Add to local state for immediate UI update
      setTransactions(prev => [response.transaction, ...prev]);
      setShowAddModal(false);
      resetForm();
      
      // Show success message
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  }, [user.role, formData]);

  const handleEditTransaction = useCallback((transaction) => {
    if (user.role === 'read-only') {
      alert('Read-only users cannot edit transactions');
      return;
    }

    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: Number(transaction.amount).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }), 
      description: transaction.description,
      date: transaction.transaction_date || transaction.date
    });
    setShowAddModal(true);
  }, [user.role]);

  const handleUpdateTransaction = useCallback(async (e) => {
    e.preventDefault();

    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount.replace(/,/g, '')),
        description: formData.description,
        transaction_date: formData.date
      };

      const response = await api.updateTransaction(editingTransaction.id, transactionData);
      
      // Update in local state
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id ? response.transaction : t
      ));

      setShowAddModal(false);
      setEditingTransaction(null);
      resetForm();
      
      alert('Transaction updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  }, [editingTransaction, formData]);

  const handleDeleteTransaction = useCallback(async (id) => {
    if (user.role === 'read-only') {
      alert('Read-only users cannot delete transactions');
      return;
    }

    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(id);
        
        // Remove from local state
        setTransactions(prev => prev.filter(t => t.id !== id));
        
        alert('Transaction deleted successfully!');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  }, [user.role]);

  const resetForm = useCallback(() => {
    setFormData({
      type: 'expense',
      category: 'Food',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutUser();
    }
  }, [logoutUser]);

  // Colors for Pie Chart
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">  
        <div className="header-content">
          <div className="header-left">
            <div className="app-header-wrapper">
              
              <h1 className="app-title">Finance Tracker</h1>
            </div>
            <p className="user-greeting">
              Welcome back, <strong>{user.username}</strong> 
              <span className={`role-badge ${user.role}`} style={{ marginLeft: '8px' }}>
                {user.role === 'admin' && '👑 '}
                {user.role === 'user' && '👤 '}
                {user.role === 'read-only' && '👁️ '}
                {user.role}
              </span>
            </p>
          </div>
          <div className="header-right">
            <button 
              className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-btn ${view === 'transactions' ? 'active' : ''}`}
              onClick={() => setView('transactions')}
            >
              💳 Transactions
            </button>
            {user.role === 'admin' && (
              <button 
                className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
                onClick={() => setView('admin')}
              >
                👥 Admin Panel
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Read-only User Permission Alert */}
        {user.role === 'read-only' && (
          <div className="permission-alert">
            <div className="permission-alert-icon">ℹ️</div>
            <div className="permission-alert-content">
              <h4>Read-only Access</h4>
              <p>You can view all your data, but you cannot add, edit, or delete transactions. Contact an administrator to change your permissions.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: 'white',
            fontSize: '18px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
            Loading transactions...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            color: '#ef4444'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ margin: 0, fontSize: '16px' }}>{error}</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
              Check your connection, ensure the backend server is running, or contact support.
            </p>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {view === 'dashboard' ? (
              /* DASHBOARD VIEW */
              <div className="dashboard-view">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card income-card">
               <img src={MoneyCash} alt="Income" className='card-icon' />
                <div className="card-content">
                  <p className="card-label">Total Income</p>
                  <h2 className="card-value">₹{totalIncome.toLocaleString('en-IN')}</h2>
                </div>
              </div>

              <div className="summary-card expense-card">
                <img src={MoneyGoing} alt="Expenses" className='card-icon' />
                <div className="card-content">
                  <p className="card-label">Total Expenses</p>
                  <h2 className="card-value">₹{totalExpense.toLocaleString('en-IN')}</h2>
                </div>
              </div>

              <div className={`summary-card balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
                <img src={BalanceLeft} alt="Balance" className='card-icon' />
                <div className="card-content">
                  <p className="card-label">Balance</p>
                  <h2 className="card-value">₹{balance.toLocaleString('en-IN')}</h2>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              {/* Pie Chart - Category Breakdown */}
              <div className="chart-card">
                <h3 className="chart-title">📊 Category-wise Expenses (Pie Chart)</h3>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No expense data to display
                  </p>
                )}
              </div>

              {/* Bar Chart - Income vs Expense */}
              <div className="chart-card">
                <h3 className="chart-title">📈 Income vs Expenses (Bar Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#333">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart - Monthly Trends */}
              <div className="chart-card">
                <h3 className="chart-title">📉 Monthly Income vs Expenses (Line Chart)</h3>
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}> 
                    <LineChart data={monthlyTrendData} margin={{ right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Income"
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Expenses"
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    No monthly trend data to display
                  </p>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="recent-transactions">
              <div className="section-header">
                <h3 className="section-title">📋 Recent Transactions</h3>
                {user.role !== 'read-only' && (
                  <button className="add-btn" onClick={() => setShowAddModal(true)}>
                    + Add Transaction
                  </button>
                )}
              </div>
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(0, 5).map(transaction => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                        <td>{transaction.category}</td>
                        <td>{transaction.description}</td>
                        <td>
                          <span className={`type-badge ${transaction.type}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`amount ${transaction.type}`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', 
                                                                        { minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                        })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="view-all-btn" onClick={() => setView('transactions')}>
                View All Transactions →
              </button>
            </div>
          </div>
        ) : view === 'transactions' ? (
          /* TRANSACTIONS VIEW */
          <div className="transactions-view">
            <div className="transactions-header">
              <h2 className="page-title">💳 All Transactions</h2>
              {user.role !== 'read-only' && (
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                  + Add Transaction
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-group">
                <label>Filter by Type:</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="search-group">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
           
            {/* Transactions List */}
            <div className="transactions-list">
              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="transactions-table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        {user.role !== 'read-only' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      
                      {filteredTransactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                          <td>{transaction.category}</td>
                          <td>{transaction.description}</td>
                          <td>
                            <span className={`type-badge ${transaction.type}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`amount ${transaction.type}`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', 
                                                                        {minimumFractionDigits: 2,
                                                                           maximumFractionDigits: 2
                                                                        })}                                               
                          </td>
                          {user.role !== 'read-only' && (
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-btn edit-btn" 
                                  onClick={() => handleEditTransaction(transaction)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="action-btn delete-btn" 
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : view === 'admin' && user.role === 'admin' ? (
          /* ADMIN VIEW */
          <div className="admin-view">
            <div className="admin-header">
              <h2 className="page-title" style={{ color: '#333' }}>👥 User Management</h2>
              <div className="role-info">
                <span className="role-badge admin">Admin Access</span>
              </div>
            </div>

            {/* Role Descriptions */}
            <div className="role-descriptions">
              <div className="role-desc-card">
                <div className="role-icon">👑</div>
                <h4>Admin</h4>
                <p>Full access to all features including user management</p>
              </div>
              <div className="role-desc-card">
                <div className="role-icon">👤</div>
                <h4>User</h4>
                <p>Can manage their own transactions and view analytics</p>
              </div>
              <div className="role-desc-card">
                <div className="role-icon">👁️</div>
                <h4>Read-only</h4>
                <p>Can only view data, cannot add, edit, or delete</p>
              </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: 'white',
                borderRadius: '16px',
                color: '#667eea'
              }}>
                Loading users...
              </div>
            ) : (
              <div className="users-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>
                          <strong>{u.username}</strong>
                          {u.id === user.id && <span style={{ color: '#667eea', marginLeft: '8px' }}>(You)</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === 'admin' && '👑 '}
                            {u.role === 'user' && '👤 '}
                            {u.role === 'read-only' && '👁️ '}
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleOpenRoleModal(u)}
                            disabled={u.id === user.id}
                            title={u.id === user.id ? "Cannot change your own role" : "Change role"}
                          >
                            🔐 Change Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
          </>
        )}
      </main>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
          resetForm();
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}>
              <div className="form-group">
                <label>Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={handleInputChange}
                    />
                    <span>Income</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={handleInputChange}
                    />
                    <span>Expense</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  className="form-input"
                  //step="0.01"
                  //min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change User Role</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>User:</strong> {selectedUser.username}</p>
                <p><strong>Current Role:</strong> <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span></p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Select New Role:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className={`role-option-btn ${selectedUser.role === 'admin' ? 'selected' : ''}`}
                    onClick={() => handleUpdateUserRole(selectedUser.id, 'admin')}
                    disabled={selectedUser.role === 'admin'}
                  >
                    <span className="role-icon">👑</span>
                    <div>
                      <strong>Admin</strong>
                      <p>Full access including user management</p>
                    </div>
                  </button>

                  <button
                    className={`role-option-btn ${selectedUser.role === 'user' ? 'selected' : ''}`}
                    onClick={() => handleUpdateUserRole(selectedUser.id, 'user')}
                    disabled={selectedUser.role === 'user'}
                  >
                    <span className="role-icon">👤</span>
                    <div>
                      <strong>User</strong>
                      <p>Can manage own transactions</p>
                    </div>
                  </button>

                  <button
                    className={`role-option-btn ${selectedUser.role === 'read-only' ? 'selected' : ''}`}
                    onClick={() => handleUpdateUserRole(selectedUser.id, 'read-only')}
                    disabled={selectedUser.role === 'read-only'}
                  >
                    <span className="role-icon">👁️</span>
                    <div>
                      <strong>Read-only</strong>
                      <p>Can only view data</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;



