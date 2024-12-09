var express = require('express');
const axios = require('axios');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

const stages = {}
const soldiers = []
const weapons = [];

const currentSoldier = {}
const currentWeapon = {}

const ADD_SOLDIER_NAME_STAGE = 'ADD_SOLDIER_NAME_STAGE';
const ADD_SOLDIER_ID_STAGE = 'ADD_SOLDIER_ID_STAGE';
const ADD_SOLDIER_DIVISION_STAGE = 'ADD_SOLDIER_DIVISION_STAGE';
const SIGN_WEAPON_ID_STATE = 'SIGN_WEAPON_ID_STATE';
const SIGN_WEAPON_SOLDIER_STATE = 'SIGN_WEAPON_SOLDIER_STATE';


const token = 'EAAG3bxvxpt0BO8VNudxWGRbhZAMAwfWblPNaUnFwhJcEsZBDKwy4iqi2MiRNXWlyZA9KT6VBhav2rpQ8jgptZBdZA1HMuHsezulpMokvNfwvKa0ZC5YvF6TnISZBklXngMd8nf1uoI3dbXCF7l5dfHwQhxN61lVmyikxhOTEjFYojNdeqQWCBCWZB28YjAZAviZBgPfm8cfoZAThO76RTaVFgSYMagXSnZCEbifeVOvjW0QM';
const config = {
   headers: { Authorization: `Bearer ${token}` }
};

const sendTemplateMessage = (tmpName = 'main_list', to = '972524431050') => {

   const postData = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
         name: tmpName,
         language: {
            code: 'he'
         }
      }
    };
    sendMessage(postData)

}

const sendTextMessage = (body, to = '972524431050') => {
   const postData = {
      messaging_product: 'whatsapp',
      to,
      text: {body}
    };
    sendMessage(postData)
}

const sendMessage = (postData) => {
   axios.post('https://graph.facebook.com/v13.0/510744435452750/messages', postData, config)
   .then((response) => {
   //   console.log('Response:', response.data);
   })
   .catch((error) => {
     console.error('Error:', error.message);
   });
}

app.all('/*', function (req, res) {
   if(!!req.body.entry[0].changes[0].value.messages){
      const {from, type, text, button} = req.body.entry[0].changes[0].value.messages[0]; 
      if(type == 'text'){
         if(!!stages[from]){
            switch(stages[from]){
               case ADD_SOLDIER_ID_STAGE:
                  currentSoldier['id'] = text.body;
                  sendTextMessage('שם החייל', from)
                  stages[from] = ADD_SOLDIER_NAME_STAGE;
                  break;
               case ADD_SOLDIER_NAME_STAGE:
                  currentSoldier['name'] = text.body;
                  sendTextMessage('פלוגה',from)
                  stages[from] = ADD_SOLDIER_DIVISION_STAGE;
                  break;
               case ADD_SOLDIER_DIVISION_STAGE:
                  currentSoldier['div'] = text.body;
                  soldiers.push(currentSoldier)
                  sendTextMessage('חייל התווסף בהצלחה, תודה',from)
                  sendTextMessage(JSON.stringify(currentSoldier))
                  delete stages[from];
                  delete currentSoldier;
                  break;
               case SIGN_WEAPON_ID_STATE:
                  currentWeapon['id'] = text.body;
                  sendTextMessage('מספר אישי של חייל',from)
                  stages[from] = SIGN_WEAPON_SOLDIER_STATE;
                  break;
               case SIGN_WEAPON_SOLDIER_STATE:
                  const soldierInx = soldiers.findIndex((sold) => sold.id == text.body)
                  if(soldierInx != -1) {
                     currentWeapon['soldierId'] = text.body;
                     weapons.push(currentWeapon);
                     sendTextMessage('נשק התווסף בהצלחה, תודה',from)
                     delete stages[from];
                     delete currentWeapon;
                  } else {
                     sendTextMessage('מספר אישי לא קיים',from)
                  }
                  break;

            }
         } else {
            sendTemplateMessage('main_list', from)
         }
      }
      else if(type == 'button') {
         switch(button.payload) {
            case 'הוספת חייל':
               stages[from] = ADD_SOLDIER_ID_STAGE;
               sendTextMessage('מספר אישי',from)
               break;
            case 'משיכת נשק':
               stages[from] = SIGN_WEAPON_ID_STATE;
               sendTextMessage('מספר נשק',from)
               break;

         }
      }
   }
   res.json({ message: "Thank you for the message" });
})

app.listen(port, function () {
   console.log(`Example app listening at ${port}`)
})
