import React, { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [rewards, setRewards] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    // Fetch rewards list on component mount
    fetchRewards();
  }, []);

  // Function to handle login form submission
  const handleLogin = async (event) => {
    event.preventDefault();

    // Perform login API call to the backend
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: event.target.username.value,
        password: event.target.password.value,
      }),
      credentials: 'include', // Include cookies in the request
    });

    if (response.ok) {
      setToken(document.cookie.split('=')[1]); // Extract the token from the cookie
      fetchRewards();
    } else {
      console.log('Login failed');
    }
  };

  // Function to fetch rewards list
  const fetchRewards = async () => {
    const response = await fetch('/api/rewards', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setRewards(data);
    } else {
      console.log('Failed to fetch rewards');
    }
  };

  // Function to handle rewards filtering
  const handleFilter = () => {
    // Perform rewards filtering API call to the backend
    fetch(`/api/rewards?name=${nameFilter}&category=${categoryFilter}&price=${priceFilter}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setRewards(data);
      })
      .catch((error) => {
        console.log('Failed to filter rewards', error);
      });
  };

  return (
    <div>
      {token ? (
        <div>
          <h1>Welcome to Rewards Management</h1>
          <div>
            <h2>Filters</h2>
            <form>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
              <br />
              <label htmlFor="category">Category:</label>
              <input type="text" id="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
              <br />
              <label htmlFor="price">Price:</label>
              <input type="number" id="price" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} />
              <br />
              <button type="button" onClick={handleFilter}>Apply Filters</button>
            </form>
          </div>
          <div>
            <h2>Rewards</h2>
            {rewards.length > 0 ? (
              <ul>
                {rewards.map((reward) => (
                  <li key={reward.id}>
                    <h3>{reward.name}</h3>
                    <p>Description: {reward.description}</p>
                    <p>Price: {reward.price}</p>
                    <p>Category: {reward.category}</p>
                    <img src={reward.imageUrl} alt={reward.name} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No rewards found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" />
            <br />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
            <br />
            <button type="submit">Login</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;