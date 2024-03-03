


export const deposit = async(amount:number,  email: string) => {

    const requestData = {
      email: email,
      amount: (amount * 10),
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    };

    const url = process.env.DEPOSIT_URL || "call Payment platform";

    try{
      const data = await fetch(url, requestOptions)
      .then(response => response.json())
      
      return data;

    } catch(error){
        throw new Error(`${error}`)
      };
}


export const verifyDeposit = async (reference: string) => {

  const url = `${process.env.VERIFY_URL}/${reference}`;

  try {

    const responseData  = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response network issues');
      }
      return response.json();
    })

    return responseData;

  } catch(error) {
    return error;
  };
  

}


export const startWithdrawal = async (name: string, account_number: string, bank_code: string, amount: number) => {

  try{
    const url = process.env.RECIPIENT_CREATE_URL || "create url";

    const requestData = JSON.stringify({
      type: "nuban",
      name: name,
      account_number: account_number,
      bank_code: bank_code,
      currency: "NGN"
    });

    const responseData = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: requestData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.json()}`);
      }
      return response.json();
    })
    .then(dataObject => {
      const {data} = dataObject;
      return data;
    })

    return responseData;

  } catch(error) {
    return error;
  }

}


export const makeTransfer  = async (amount: number, recipient_code: string) => {

  const url = process.env.TRANSFER_URL || "transfer to recipient";

  const requestData = JSON.stringify({
    source: "balance",
    reason: "Bsync Withdrawal Payment",
    amount: (amount * 10),
    recipient: recipient_code,
  });

  const response: any = await fetch(url, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: requestData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`${response.json()}`);
    }
    return response.json();
  })

  return response;

}

// export const finalizeTransfer = async (otp: number, transfer_code: string) => {

//   const url = process.env.FINAL_PAYMENT || 'make transfer';

//   const requestData = JSON.stringify({ 
//     transfer_code: transfer_code, 
//     otp: otp,
//   })

//   try{

//     const responseData = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: requestData
//     })
  
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`${response.json()}`);
//       }
//       return response.json();
//     })
    
//     return responseData;
    
//   } catch(error) {
//     return`${error}`;
//   }

// }


