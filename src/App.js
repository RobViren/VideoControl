import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
		super(props);
		this.state = {
      localIP: "",
      scanDidRun: false,
      cameraIPs: []
		};
	}

  getIP = () => {
    var myIP
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
        myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        this.setState({
          localIP: myIP
        })
        pc.onicecandidate = noop;
    }.bind(this);
  }

  getURL = (url) => {
  	let resp = fetch(url, {
  		method: 'GET',
      mode: 'no-cors',
  		headers: {
  		}
  	});

    var promise = new Promise((resolve, reject) => {
      resp.then(res => {
        console.log(res)
        resolve(url)
      }).catch(error => {
        reject("Not A Camera")
      })
    });

  	return promise;
  };

  scan = () => {
    let IPs = [];
    let local = this.state.localIP
    while(local.charAt(local.length-1) !== '.'){
      local = local.substring(0, local.length - 1);
    }
    for(var i = 0; i < 255; i++){
      this.getURL("https://" + local + i + ":443").then(res => {
      //this.getURL("http://10.1.2." + i + ":443").then(res => {
        IPs.push(res)
        this.setState({
          cameraIPs: IPs
        })
      })
    }
  }

  componentWillMount() {
    this.getIP()
  }

  componentDidUpdate(nextProps, nextState) {
    if(!this.state.scanDidRun && this.state.localIP !== ""){
      console.log("Scanning")
      this.scan()
      this.setState({
        scanDidRun: true
      })
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome {this.state.localIP}</h2>
          <h3>Possible Cameras On Network</h3>
        </div>
        {this.state.cameraIPs.map((obj,i) => (
          <div><a href={obj.substring(0,obj.indexOf(":443"))} target="_blank" > {obj.substring(0,obj.indexOf(":443"))} </a></div>
        ))}
      </div>
    );
  }
}

export default App;
