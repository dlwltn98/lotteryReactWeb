import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import './App.css';

let lotteryAddress = '0x5FB0eA69B51547B38AEe00847fdD8Db6c570536A';
let lotteryABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "BET", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "annswerBlockNumber", "type": "uint256" } ], "name": "DRAW", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "annswerBlockNumber", "type": "uint256" } ], "name": "FAIL", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "annswerBlockNumber", "type": "uint256" } ], "name": "REFUND", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "annswerBlockNumber", "type": "uint256" } ], "name": "WIN", "type": "event" }, { "inputs": [], "name": "answerForTest", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "getPot", "outputs": [ { "internalType": "uint256", "name": "pot", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "betAndDistribute", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "bet", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [], "name": "distribute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "addr", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferAfterPayingFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "setAnswerForTest", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "isMatch", "outputs": [ { "internalType": "enum Lottery.BettingResult", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" }, { "internalType": "address", "name": "bettor", "type": "address" }, { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "stateMutability": "view", "type": "function", "constant": true } ];

let web3;
let account;
let lotteryContract;

function App() {

  const [betRecords, setBetRecords] = useState([]);
  const [winRecords, setWinRecords] = useState([]);
  const [failRecords, setFailRecords] = useState([]);
  const [pot, setPot] = useState('0');
  const [challenges, setChallenges] = useState(['A', 'B']);
  const [finalRecords, setFinalRecords] = useState([{ bettor: '0xabcd...'
                                                    , index: '0'
                                                    , challenges: 'ab'
                                                    , answer: 'ab'
                                                    , targetBlockNumber: '10'
                                                    , pot: '0'
                                                    }]);

  useEffect(() => {
    async function fetchAndSetUser() { 
      await initWeb3();

      setInterval(pollData, 1000);
      //await pollData();
    }
    fetchAndSetUser(); 
  },[]);

  const pollData = async () => {
    await getPot();
    await getBetEvents();
    await getWinEvents();
    await getFailEvents();
    makeFinalRecords();
  }

  const initWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);
      try {
        // Request account accress if needed
        // 페이지 연결시 요청을 시작해서는 안된다고 함 수정 필요
        await window.ethereum.request({ method: 'eth_requestAccounts' });

      } catch (error) {
        // User denied account access...
        console.log(`User denied account access error : ${error}`)
      }
    }
    // Legacy dapp browsers...
    else if (typeof window.web3 !== 'undefined') {
      web3 = new Web3(Web3.currentProvide);
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    let accounts = await web3.eth.getAccounts();
    account = accounts[0];

    //스마트 컨트랙트 객체 생성
    lotteryContract = new web3.eth.Contract(lotteryABI, lotteryAddress);

    // let owner = await lotteryContract.methods.owner().call();
    // console.log(owner)
  }

  const makeFinalRecords = () => {
    let  f = 0, w = 0;

    const records = [...betRecords];
    for(let i=0; i<betRecords.length; i+=1) {
      if(winRecords.length > 0 && betRecords[i].index === winRecords[w].index) {
        records[i].win = 'WIN';
        records[i].answer = records[i].challenge;
        records[i].pot = web3.utils.fromWei(winRecords[w].amount, 'ether');
        if(winRecords.length - 1 > w) w++;

      }else if(failRecords.length > 0 && betRecords[i].index === failRecords[f].index) {
        records[i].win = 'FAIL';
        records[i].answer = failRecords[f].answer;
        records[i].pot = 0;
        if(failRecords.length - 1 > f) f++;

      }else {
        records[i].answer = 'Not Revealed';
      }
    }
    setFinalRecords(records);
  }

  const getBetEvents = async() => {
    const records = [];
    let events = await lotteryContract.getPastEvents('BET', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1) {
      const record = {};
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.bettor = events[i].returnValues.bettor.slice(0,4) + '...' + events[i].returnValues.bettor.slice(40,42);
      record.betBlockNumber = events[i].blockNumber;
      record.targetBlockNumber = events[i].returnValues.answerBlockNumber.toString();
      record.challenges = events[i].returnValues.challenges;
      record.win = 'Not Revealed';
      record.answer = '0x00';
      records.unshift(record);
    }
    console.log(records)
    setBetRecords(records);
  }

  const getWinEvents = async() => {
    const records = [];
    let events = await lotteryContract.getPastEvents('WIN', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1) {
      const record = {};
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.amount = parseInt(events[i].returnValues.amount, 10).toString();
      records.unshift(record);
    }
    setWinRecords(records);
  }

  const getFailEvents = async() => {
    const records = [];
    let events = await lotteryContract.getPastEvents('FAIL', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1) {
      const record = {};
      record.index = parseInt(events[i].returnValues.index, 10).toString();
      record.answer = events[i].returnValues.answer;
      records.unshift(record);
    }
    setFailRecords(records);
  }

  // pot money 가져옴
  const getPot = async() => {
    let pot = await lotteryContract.methods.getPot().call();
    let potString = web3.utils.fromWei(pot.toString(), 'ether');
    setPot(potString);
  }

  // betting 
  const bet = async() => {
    let challenge = '0x' + challenges[0].toLowerCase() + challenges[1].toLowerCase();

    // nonce 
    let nonce = await web3.eth.getTransactionCount(account);
    lotteryContract.methods.betAndDistribute(challenge).send({from:account, value:5000000000000000, gas:300000, nonce:nonce})
    .on('transactionHash', (hash) => {
      console.log(hash);
    })
  }

  const onClickCard = (_character) => {
    // 1번이 0번 자리에 가고 새로 누른 값이 1번 자리에 감
    setChallenges([challenges[1],_character]);
  }

  // button card
  const getCard = (_character, _cardStyle) => {
    let card = '';
    if(_character === 'A') {
      card = '🂡';
    }
    if(_character === 'B') {
      card = '🂱';
    }
    if(_character === 'C') {
      card = '🃁';
    }
    if(_character === '0') {
      card = '🃑';
    }

    return (
      <button className={_cardStyle} onClick= {() => {
        onClickCard(_character);
      }}>
        <div className='card-body text-center'>
          <p className='card-text'></p>
          <p className='card-text text-center' style={{fontSize:250}}>{card}</p>
          <p className='card-text'></p>
        </div>
      </button>
    )
  }

  return (
    <div className='App'>

      {/* Header - Pot, Betting characters */}
      <div className='container'>
        <div className='jumbotron'>
          <h1>Current Pot : {pot}</h1>
          <p>Lottery</p>
          <p>Lottery tutorial</p>
          <p>Your Bet</p>
          <p>{challenges[0]} {challenges[1]}</p>
        </div>
      </div>

      {/* Card Section */}
      <div className='container'>
        <div className='card-group'>
          {getCard("A", "card bg-primary")}
          {getCard("B", "card bg-warning")}
          {getCard("C", "card bg-danger")}
          {getCard("0", "card bg-success")}
        </div>
      </div>

      <br></br>
      <div className='container'>
        <button className='btn btn-danger btn-lg' onClick={bet}>BET!</button>
      </div>

      <br></br>
      <div className='container'>
        <table className='table table-dark table-striped'>
          <thead>
            <tr>
              <th>Index</th>
              <th>Address</th>
              <th>Challenge</th>
              <th>Answer</th>
              <th>Pot</th>
              <th>Status</th>
              <th>AnswerBlockNumber</th>
            </tr>
          </thead>
          <tbody>
            {
              finalRecords.map((record, index) => {
                
                return (
                  <tr key={index}>
                    <td>{record.index}</td>
                    <td>{record.bettor}</td>
                    <td>{record.challenges}</td>
                    <td>{record.answer}</td>
                    <td>{record.pot}</td>
                    <td>{record.win}</td>
                    <td>{record.targetBlockNumber}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>

    </div>
  )
}
export default App;