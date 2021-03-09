import logo from './logo.svg';
import './App.css';
import React, { Component, useState} from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, FormFile, Container } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink, Router, BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import { DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem} from "carbon-components-react";
import "carbon-components/css/carbon-components.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      all_data_from_db: [],
      note: '',
      email: '',
      firstName: '',
      lastName: '',
      description: '',
      participants: '',
      selected_session_ts: '',
      event_start_date: '',
      event_start_time: '',
      event_end_time: '',
      show_register_form: false,
      show_edit_form: false,
      show_create_form: false,
      columns: [
         {
           dataField: "start_time_formatted",
           text: "Time",
           sort: true
         },
         {
           dataField: "duration_minutes",
           text: "Duration (minutes)",
           sort: true
         },
         {
           dataField: "event_description",
           text: "Event description",
           sort: true
         },
         {
           dataField: "num_spots",
           text: "Spots Left",
           sort: true
         },
         {
           dataField: "register",
           text: "",
           formatter: this.linkRegister,
           sort: true
         },
         {
           dataField: "edit",
           text: "",
           formatter: this.linkEdit,
           sort: true
         }
       ],
    };

    this.handleClose = this.handleClose.bind(this);

  }

  handleClose() {
    this.setState({['show_register_form'] : false});
  }

  onRegisterFormSubmit(e) {
    e.preventDefault();
    // console.log("hello" + this.state.firstName + ' ' + this.state.lastName + ' ' + this.state.email, + ' ' + this.state.selected_session_ts);
    this.handleClose();
    this.sendRegisteration();
  };

  onEditFormSubmit(e) {
    e.preventDefault();
    // console.log("hello" + this.state.firstName + ' ' + this.state.lastName + ' ' + this.state.email, + ' ' + this.state.selected_session_ts);
    this.handleEditClose();
    this.updateSession();
  };

  onCreateFormSubmit(e) {
    e.preventDefault();
    this.handleCreateClose();
  };


  onRegisterChanged(row) {
    this.setState({['show_register_form'] : true});
    this.setState({['selected_session_ts'] : row['start_time']});
    console.log(row, row['start_time']);
  };

  onCreateEvent(row) {
    this.setState({['show_create_form'] : true});
    this.setState({['description'] : ''});
  };

  onEditChanged(row) {
    this.setState({['show_edit_form'] : true});
    this.setState({['selected_session_ts'] : row['start_time']});
    var result = this.state.all_data_from_db.find(item => item.start_time === row['start_time'])
    this.setState({['description'] : result['event_description']});
    var participants = JSON.parse(result['participants']);
    var output = participants.map(item => item.Email)
    this.setState({['participants'] : output});
    console.log(row);
  };

  handleEditClose() {
    this.setState({['show_edit_form'] : false});
  }

  handleCreateClose() {
    this.setState({['show_create_form'] : false});
  }

  handleChange(e) {
   const target = e.target;
   const name = target.name;
   const value = target.value;

   this.setState({
     [name]: value
   });
 }

  linkRegister = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button
        onClick={() => {
          this.onRegisterChanged(row);
        }}
      >
        Register
      </Button>
    );
  };

  linkEdit = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button
        onClick={() => {
          this.onEditChanged(row);
        }}
      >
        Edit
      </Button>
    );
  };

  async updateSession() {
    await axios({
        method: 'post',
        url: 'https://cqakerxfi7.execute-api.us-west-2.amazonaws.com/prod/manageSessions/',
        params: { reqType: 'update_session'},
        data: {
            'selected_session_ts' : this.state.selected_session_ts,
            'description' : this.state.description,
        },
      //   headers: {
      //   'Access-Control-Allow-Origin' : '*',
      // },
      })
    .then((response) => {
      console.log(response);
      this.getSessions()
    }, (error) => {
      console.log(error);
    });
  }


  async sendRegisteration() {
    // await axios.post(
    //   'https://cqakerxfi7.execute-api.us-west-2.amazonaws.com/prod/manageSessions/',
    //   {
    //   'selected_session_ts' : this.state.selected_session_ts,
    //   'email' : this.state.email,
    //   'firstName' : this.state.firstName,
    //   'lastName' : this.state.lastName
    //   }

    await axios({
        method: 'post',
        url: 'https://cqakerxfi7.execute-api.us-west-2.amazonaws.com/prod/manageSessions/',
        params: { reqType: 'register_participant'},
        data: {
            'selected_session_ts' : this.state.selected_session_ts,
            'email' : this.state.email,
            'firstName' : this.state.firstName,
            'lastName' : this.state.lastName
        },
      //   headers: {
      //   'Access-Control-Allow-Origin' : '*',
      // },
      })
    .then((response) => {
      console.log(response);
      this.getSessions()
    }, (error) => {
      console.log(error);
    });
  }

  async getSessions(event) {
    if (event) {
      event.preventDefault();
    }
    await axios.get(
      'https://cqakerxfi7.execute-api.us-west-2.amazonaws.com/prod/manageSessions/',
      { params: { reqType: 'summary' } }
    ).then((response) => {
  console.log('response:', response);
  this.setState({['all_data_from_db'] : response.data});
  var result = JSON.parse( this.state.all_data_from_db[0]['participants']);
  console.log('response data:', result[0]['Email']);
}, (error) => {
  console.log(error);
});
  }

  componentDidMount(event) {
    this.getSessions();
  }

  render() {
    return (
      <Container>
      {/* ************************ HEADLINE ************************* */}
      <div className="row top-container">
        <div className="headline-container col-lg-5">
          <div className="headline">
            <h1>Amotions</h1>
            <p>A platform for sharing and improving
              emotional and mental health and EQ</p>
            <button type="button" className="login-button btn btn-dark">SIGN UP / LOG IN</button>
          </div>
        </div>

        <div className="top-image col-lg-7">
          <img src="bg.png" className="top-image" style={{"width": "103%"}} alt="plants image"/>
        </div>

      </div>

      {/*<!-- ************************  HOW DOES IT WORK  ************************* -->*/}
      <h2 className="title">How Does It Work</h2>
      <hr className="hr-title-line"/>

      <div className="row" style={{"marginTop":"30px"}}>
        <div className="col-lg-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">A Platform For Sharing and Helping Each Other</h4>
              <p className="card-text gray-text">You can join virtual sessions to connect and share with each other what's going on in your life and in your mind, and improve emotional intelligence and wellness and mental health.</p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Practice Empathetic Listening</h4>
              <p className="card-text gray-text">Sessions often start with a loving kindness meditation to cultivate a compassionate environment. You can even volunteer to receive trainings and become a moderator.</p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Improve emotional and mental health and Emotional Intelligence</h4>
              <p className="card-text gray-text">Through sharing and listening, you and other users will help each other improve mental and emotional wellbeing and emotional intelligence. We will also provide you with tips on how to stay calm. Long term we
                will
                provide you with artificial intelligence powered real time advice for you to reduce stress, based on understanding your facial expressions, voice, tones, and body languages.</p>
            </div>
          </div>
        </div>
      </div>
      {/*<!-- ************************  Group Virtual Sessions  ************************* -->*/}

      <h2 className="title">Upcoming Group Virtual Sessions</h2>
      <hr className="hr-title-line"/>
      <Button
        variant="primary"
        onClick={e => this.onCreateEvent(e)}>
        Create Event
      </Button>
      <BootstrapTable
        keyField="id"
        data={this.state.all_data_from_db}
        columns={this.state.columns}
      />
      <Modal show={this.state.show_register_form} onHide={e => this.handleClose(e)}>
        <Modal.Header closeButton>
          <Modal.Title>Registeration</Modal.Title>
        </Modal.Header>
        <Form.Group controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={this.state.firstName}
            name="firstName"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={this.state.lastName}
            name="lastName"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={this.state.email}
            name="email"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group>
           <Button
           variant="primary"
           type="button"
           onClick={e => this.onRegisterFormSubmit(e)}
           block>
             Register
           </Button>
        </Form.Group>
      </Modal>
      <Modal show={this.state.show_edit_form} onHide={e => this.handleEditClose(e)}>
        <Modal.Header closeButton>
          <Modal.Title>Event details</Modal.Title>
        </Modal.Header>
        <Form.Group controlId="description">
          <Form.Label>Event description</Form.Label>
          <Form.Control
            type="text"
            value={this.state.description}
            name="description"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group controlId="participants">
          <Form.Label>List of participants</Form.Label>
          <Form.Control
            type="text"
            as="textarea"
            rows={5}
            readonly="true"
            value={this.state.participants}
            name="participants"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group>
           <Button
           variant="primary"
           type="button"
           onClick={e => this.onEditFormSubmit(e)}
           block>
             Save
           </Button>
        </Form.Group>
      </Modal>
      <Modal show={this.state.show_create_form} onHide={e => this.handleCreateClose(e)}>
        <Modal.Header closeButton>
          <Modal.Title>Event details</Modal.Title>
        </Modal.Header>
        <Form.Group controlId="description">
          <Form.Label>Event description</Form.Label>
          <Form.Control
            type="text"
            value={this.state.description}
            name="description"
            placeholder=""
            onChange={e => this.handleChange(e)}
          />
        </Form.Group>
        <Form.Group controlId="event_date">
          <DatePicker
            id="date-picker"
            datePickerType="single"
            icondescription="Icon description"
            onChange={e => {
              console.log(new Date(e));
              this.setState(
                {
                  event_start_date: new Date(e)
                },
              );
            }}
          >
          <DatePickerInput
            id="date-picker-input-id-start"
            className="some-class"
            labelText="Date Picker label"
            placeholder="mm/dd/yyyy"
            invalidText="A valid value is required"
          />
          </DatePicker>
          <TimePicker
            id="time-picker"
            icondescription="Icon description"
            onChange={e => {
              console.log(e);
              this.setState(
                {
                  event_start_time: e
                },
              );
            }}
          >
          <TimePickerSelect
            id="time-picker-input-id-end"
            className="some-class"
            labelText="Date Picker label"
            >
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
          </TimePicker>
          <TimePicker
            id="time-picker"
            icondescription="Icon description"
            onChange={e => {
              console.log(e);
              this.setState(
                {
                  event_end_time: e
                },
              );
            }}
          >
          <TimePickerSelect
            id="time-picker-input-id-start"
            className="some-class"
            labelText="Date Picker label"
            >
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
          </TimePicker>

        </Form.Group>

        <Form.Group>
           <Button
           variant="primary"
           type="button"
           onClick={e => this.onCreateFormSubmit(e)}
           block>
             Create Event
           </Button>
        </Form.Group>
      </Modal>

      {/*<!-- ************************  Testimonials  ************************* -->*/}

      <h2 className="title">Testimonials</h2>
      <hr className="hr-title-line"/>

      <div className="testimonial-card">
        <h5>Kim M.</h5>
        <p className="gray-text">“I have been really challenged to live in the present these two weeks. What I found through the session today is my body is more relaxed through our session, and I feel more present to my physical body, and this is very
          helpful for me, because I feel more balanced, and I probably make better decisions when I feel more balanced.”</p>
      </div>


      <div className="testimonial-card">
        <h5>Ben T.</h5>
        <p className="gray-text">“Through this event, it allows me to understand myself better. Every person has different perspectives and different emotions, happy or not happy, or anger, hear different perspectives will help us to learn and see a bigger
          picture. I would like to get myself better at listening because I believe listening is an important skill for me to connect with myself and others. Everyone is very kind and open up to share their emotions, and allows me to understand all the
          people better.”</p>
      </div>


      <div className="testimonial-card">
        <h5>Yakubu A.</h5>
        <p className="gray-text">“There are a lot of things I have gotten out of this and that was unexpected. I really like how everyone in this group is different. What I think that brings us all together, despite of everyone is different, there’s a trust
          layer. So I can be honest, and I don’t need to say everything is great. I felt really good, I felt heard, everyone was actually listening. Also the benefit of listening to other people, heard similar experiences from other people.”</p>
      </div>



      {/*<!-- ************ Footer *********** -->*/}
      <hr />
      <div className="footer">
        <h6 className="footer-brand">Amotions Inc</h6>
        <p className="copyright-text gray-text">Copyright © 2020 Amotions Inc - All Rights Reserved.</p>
      </div>

      </Container>
      );
    }
  }
