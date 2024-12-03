import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const BirthdayManager = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthQuery, setMonthQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  const fetchBirthdays = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get-birthdays');
      setList(response.data.data);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const handleAdd = async () => {
    if (name && dob && email) {
      setLoading(true);
      setOverlayMessage('Adding birthday...');
      try {
        await axios.post('http://localhost:5000/api/add-birthday', { name, dob, email });
        fetchBirthdays();
        setName('');
        setDob('');
        setEmail('');
        setOverlayMessage('Birthday added successfully!');
      } catch (error) {
        console.error('Error adding birthday:', error);
        setOverlayMessage('Error adding birthday.');
      } finally {
        setLoading(false);
        setTimeout(() => setOverlayMessage(''), 2000);
      }
    } else {
      console.error('Please enter all fields');
      setOverlayMessage('Please enter all fields.');
      setTimeout(() => setOverlayMessage(''), 2000);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this birthday?");
    if (!confirmDelete) return;

    setLoading(true);
    setOverlayMessage("Deleting birthday...");
    try {
      await axios.delete(`http://localhost:5000/api/delete-birthday/${id}`);
      fetchBirthdays();
      setOverlayMessage("Birthday deleted successfully!");
    } catch (error) {
      console.error("Error deleting birthday:", error);
      setOverlayMessage("Error deleting birthday.");
    } finally {
      setLoading(false);
      setTimeout(() => setOverlayMessage(""), 2000);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const filteredList = sortedList.filter((item) => {
    const matchesName = item.name.toLowerCase().startsWith(searchQuery.toLowerCase());
    const matchesMonth = monthQuery
      ? new Date(item.dob).getMonth() + 1 === parseInt(monthQuery)
      : true;
    return matchesName && matchesMonth;
  });

  return (
    <div>
      <div className="birthday">
        <h1>Birthday Manager</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
          />
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Birthday'}
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name starting with..."
        />
        <select
          value={monthQuery}
          onChange={(e) => setMonthQuery(e.target.value)}
        >
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      <div className="container">
        <h2 className="title">🎉 Birthday List 🎉</h2>

        <div className="emp">
          {filteredList.map((item) => (
            <div key={item._id} className="card">
              <h3 className="card-title">{item.name}</h3>
              <p className="card-dob">📅 {formatDate(item.dob)}</p>
              <p className="card-email">📧 {item.email}</p>
              <button
                className="delete-button"
                onClick={() => handleDelete(item._id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {overlayMessage && <div className="overlay">{overlayMessage}</div>}
    </div>
  );
};

export default BirthdayManager;