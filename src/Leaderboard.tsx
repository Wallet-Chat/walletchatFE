// Leaderboard.tsx

import React, { useEffect, useState } from 'react';
//import { useAppSelector } from './hooks/useSelector'
//import { selectAccount } from './redux/reducers/account'
import axios from 'axios';

//const account = useAppSelector((state) => selectAccount(state))

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    axios.get('https://api.v2.walletchat.fun/get_leaderboard_data')
      .then((response) => {
        setLeaderboardData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
      });
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Username</th>
            <th>Messages Sent</th>
            <th>Messages Received</th>
            <th>Unique Conversations</th>
            <th>Installed Snap</th>
            <th>Redeemed Count</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((item, index) => (
            <tr key={index}>
              <td>{item.Walletaddr}</td>
              <td>{item.Username}</td>
              <td>{item.MessagesTx}</td>
              <td>{item.MessagesRx}</td>
              <td>{item.UniqueConvos}</td>
              <td>{item.Installedsnap}</td>
              <td>{item.RedeemedCount}</td>
              <td>{item.Points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
