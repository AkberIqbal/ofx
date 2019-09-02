import React from 'react';
import './App.css';

{/* https://stackblitz.com/edit/react-fxp7y4?file=index.html */ }

class OFXForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fields: {},
      errors: {},
      countries: [
        { mnemonic: 'AU', code: '+61', currencyCode: 'AUD', currencyName: 'Australian Dollar' },
        { mnemonic: 'US', code: '+1', currencyCode: 'USD', currencyName: 'United States Dollar' },
        { mnemonic: 'UK', code: '+44', currencyCode: 'GBP', currencyName: 'Great Britian Pound' },
        { mnemonic: 'PK', code: '+92', currencyCode: 'PKR', currencyName: 'Pakistan rupee' },
      ],
      formFilled: false,
      dataRequested: false,
      dataFetched: false,
      apiException: '',
    }

    this.state.fields['telCode'] = '+61';
    this.state.fields['fcurr'] = 'AUD';
    this.state.fields['tcurr'] = 'USD';
    this.state.fields['amount'] = 25000.00;

  }
  contactSubmit(event) {
    event.preventDefault();
    if (this.handleValidation()) {
      this.setState({ formFilled: true });
      this.callAPI();
    } else {
      //errors
    }
  }

  handleValidation() {
    let fields = this.state.fields;
    let errors = {};
    let formIsValid = true;

    if (!fields["fname"]) {
      formIsValid = false;
      errors["fname"] = "First Name is a required field";
    }
    if (!fields["lname"]) {
      formIsValid = false;
      errors["lname"] = "Last Name is a required field";
    }

    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (fields["email"]) {
      if (re.test(fields["email"])) {
      } else {
        formIsValid = false;
        errors["email"] = "Not a valid email";
      }
    }

    if (fields["phone"]) {
      if (isNaN(fields["phone"])) {
        formIsValid = false;
        errors["phone"] = "Phone number has to be numbers only";
      }
    }

    /*    if (!fields["fcurr"]) {
          formIsValid = false;
          errors["fcurr"] = "From currency is a required field";
        }
    
        if (!fields["tcurr"]) {
          formIsValid = false;
          errors["tcurr"] = "To currency is a required field";
        }
    */
    if (fields["fcurr"] == fields["tcurr"]) {
      formIsValid = false;
      errors["tcurr"] = "To & From currencies must be different";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }


  callAPI(e) {

    let apiURL = 'https://api.ofx.com/PublicSite.ApiService/OFX/spotrate/Individual/' + this.state.fields['fcurr'] + '/' + this.state.fields['tcurr'] + '/' + this.state.fields['amount'] + '?format=json';
 
    this.setState({ dataRequested: true })
    fetch(apiURL)

      .then(res => res.json())
      .then((data) => {
        console.log("data:", data);
        if (data.ErrorCode) {
          this.setState({ apiException: data.Message });

        } else {

          this.setState({ apiData: data, dataFetched: true })
        }
      })
      .catch(exp => {
        this.setState({ dataRequested: true, apiException: 'Sorry, something went wrong with the API call, please try again later' });
        console.log("exp: ", exp)
      })
  }


  handleChange(field, e) {
    let fields = this.state.fields;
    fields[field] = e.target.value;
    this.setState({ fields });
  }

  handleSelectChange(fieldName, e) {
    console.log('for ', fieldName, ' inside', e.target.value);
    this.setState({ telCode: e.target.value });
  }

  startNewQuote(e) {
    this.setState({
      formFilled: false,
      dataRequested: false,
      dataFetched: false,
      apiException: '',
    });
  }

  render() {

    let myTelephoneCodes = this.state.countries.map((obj, indx) => {
      return <option key={indx} value={obj.code}  >{obj.code}</option>
    });

    let myCurrencies = this.state.countries.map((obj, indx) => {
      return <option key={indx} value={obj.currencyCode}  >{obj.currencyName} ({obj.currencyCode})</option>
    });

    if (this.state.formFilled)  {

      if (this.state.apiException != '' ) {
        return <>
          <div className='container'>
            <h1>Error</h1>
            <hr />
            <div className='resultDiv'>

              {(this.state.apiException != '' || this.state.dataRequested) ? <p className='exceptionAPI'>{this.state.apiException}</p> : ''}


              <div className='col-12 text-center'>
                <button type='button' className='submitBtn' onClick={this.startNewQuote.bind(this)} > Get Quote </button>
              </div>
            </div>
          </div>

        </>

      }
      else {
        return <>
          <div className='d-flex '>
          <div className='mr-auto ml-auto'>
            <h1>Quick Quote</h1>
            <hr />
            <div className='resultDiv'>

              {/* 
                  <hr />
                  apiData:{JSON.stringify(this.state.apiData)}
                  <br />dataRequested:      {JSON.stringify(this.state.dataRequested)}
                  <br />dataFetched:      {JSON.stringify(this.state.dataFetched)}
                  {(this.state.apiData) ? <>CustomerRate: {this.state.apiData.CustomerRate}</> : ''}
                  {(this.state.apiData) ? <>CustomerAmount: {this.state.apiData.CustomerAmount}</> : ''}
                  <br />From Currency: {this.state.fields['amount']}
            */}

              <div className='resultDivHeadline'>
                <p className='ofxText'>OFX Customer Rate </p>
                <span className='conversionRate'>{(this.state.apiData) ? <>{this.state.apiData.CustomerRate.toLocaleString(navigator.language, { minimumFractionDigits: 4 })}</> : ''}</span>
              </div>
              <p className='ofxText'>From </p>
              <span className='currencyCode'>{this.state.fields['fcurr']} </span> <span className='calculatedAmount'>{this.state.fields['amount'].toLocaleString(navigator.language, { minimumFractionDigits: 2 }) }</span> <br />
              <p className='ofxText'>To</p>
              <span className='currencyCode'>{this.state.fields['tcurr']} </span> <span className='calculatedAmount'>{(this.state.apiData) ? <>{this.state.apiData.CustomerAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) }</> : ''}</span> <br />
              <div className='col-12 text-center'>
                <button type='submit' className='submitBtn' onClick={this.startNewQuote.bind(this)} > Start new quote </button>
              </div>
            </div>
          </div>
          </div>
        </>
      }



    }
    else {
      return (
        <>
          <div className='container'>
            <h1>Quick Quote</h1>
            <hr />
            <form name="contactform" className="qouteForm row" onSubmit={this.contactSubmit.bind(this)}>

              <div className='col-12 col-sm-6'>
                <div className="form-group">
                  <label htmlFor="fname">First Name: <span className='requiredField'>*</span></label>
                  <input type="text" className="form-control" id="fname" placeholder="First Name" onChange={this.handleChange.bind(this, "fname")} value={this.state.fields["fname"] || ''} />
                  <span className='errorMessage'>{this.state.errors['fname']} </span>
                </div>
              </div>

              <div className='col-12 col-sm-6'>
                <div className="form-group">
                  <label htmlFor="lname">Last Name: <span className='requiredField'>*</span></label>
                  <input type="text" className="form-control" id="lname" placeholder="Last Name" onChange={this.handleChange.bind(this, "lname")} value={this.state.fields["lname"] || ''} />
                  <span className='errorMessage'>{this.state.errors['lname']} </span>
                </div>
              </div>

              <div className='col-12'>
                <div className="form-group">
                  <label htmlFor="email">Email: </label>
                  <input type="text" className="form-control" id="email" placeholder="Email" onChange={this.handleChange.bind(this, "email")} value={this.state.fields["email"] || ''} />
                  <span className='errorMessage'>{this.state.errors['email']} </span>
                </div>
              </div>

              <div className='col-12'>
                <div className="form-group ">
                  <label htmlFor="phone">Telephone/Mobile: </label>
                  <div className='row phoneRow'>
                    <div className='col-4 col-sm-3 col-md-2'>
                      <select className="form-control currencyDD" onChange={this.handleChange.bind(this, 'telCode')} value={this.state.fields["telCode"]} >
                        {myTelephoneCodes}
                      </select>
                    </div>

                    <div className='col-8 col-sm-9 col-md-10'>
                      <input type="text" className="form-control" id="phone"  onChange={this.handleChange.bind(this, "phone")} value={this.state.fields["phone"] || ''} />
                      <span className='errorMessage'>{this.state.errors['phone']} </span>
                    </div>
                  </div>
                </div>
              </div>


              <div className='col-12 col-sm-6'>
                <div className="form-group">
                  <label htmlFor="fcurr">From Currency: <span className='requiredField'>*</span></label>
                  <select className="form-control currencyDD" onChange={this.handleChange.bind(this, 'fcurr')} value={this.state.fields["fcurr"]} >
                    {myCurrencies}
                  </select>
                </div>
              </div>

              <div className='col-12 col-sm-6'>
                <div className="form-group">
                  <label htmlFor="tcurr">To Currency: <span className='requiredField'>*</span></label>
                  <select className="form-control currencyDD" onChange={this.handleChange.bind(this, 'tcurr')} value={this.state.fields["tcurr"]} >
                    {myCurrencies}
                  </select>
                </div>
              </div>
              <div className='col-12 errorMessageCurr'>
                <span className='errorMessageCurr'>{this.state.errors['tcurr']} </span>
              </div>


              <div className='col-12'>
                <div className="form-group">
                  <label htmlFor="amount">Amount: </label>
                  <input type="number" className="form-control" id="amount" placeholder="Amount" onChange={this.handleChange.bind(this, "amount")} value={this.state.fields["amount"]} step="0.01" min="0.01" />
                  <span className='errorMessage'>{this.state.errors['amount']} </span>
                </div>
              </div>

              <div className='col-12 text-center'>
                <button type='submit' className='submitBtn' > Get Quote </button>
              </div>

            </form>
          </div>
          {/* 
          <br /> [TEL:{this.state.telCode}] - {this.state.fields['tcurr']}
          <br />FIELD:      {JSON.stringify(this.state.fields)}
          <br />ERROR:      {JSON.stringify(this.state.errors)}
          */}
        </>
      )
    }
  }
}

function App() {
  return (
    <div className="App">
      <OFXForm />
    </div>
  );
}

export default App;
