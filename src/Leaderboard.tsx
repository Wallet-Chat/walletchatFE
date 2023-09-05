// Leaderboard.tsx

import React, { useEffect, useState } from 'react';
import { useAppSelector } from './hooks/useSelector'
import { selectAccount } from './redux/reducers/account'
import axios from 'axios';
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'

const Leaderboard = () => {
  const account = useAppSelector((state) => selectAccount(state))

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);

  useEffect(() => {
    axios.get('https://api.v2.walletchat.fun/get_leaderboard_data')
      .then((response) => {
        setLeaderboardData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
      });

      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_referral_code`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
        }
      )
        .then((response) => response.json())
        .then((response) => {
            setReferralCodes(response);
          })
        .catch((error) => {
          console.error('🚨[GET][Get Referral Codes Failed]:', error)
        })
  }, []);

  return (
    <div className="leaderboard">

      <h2>Referral Codes</h2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {referralCodes.map((code) => (
            <tr key={code.Id}>
              <td>
                {code.redeemed ? (
                  <del>{code.code}</del>
                ) : (
                  <>
                    {code.code}
                  </>
                )}
              </td>
              <td>{code.redeemed ? 'Redeemed' : 'Not Redeemed'}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
