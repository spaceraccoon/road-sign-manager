const axios = require("axios")

function getTime() {
  var date = new Date();
  date.setMinutes(0);
  date.setSeconds(0);
  date = date.toISOString().replace(/\.[0-9]{3}Z/, '');
  return date;
}

async function fetchData(garageId) {
  try {
    let response = await axios.get(`https://my.smarking.net/api/users/v1/garages/id/${garageId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SMARKING_KEY}`
      }
    });
    let spaces = response.data.spaces;
    let name = response.data.name;
    response = await axios.get(`https://my.smarking.net/api/ds/v3/garages/${garageId}/current/occupancy`, {
      headers: {
        Authorization: `Bearer ${process.env.SMARKING_KEY}`
      }
    });
    let occupancy = response.data.value[0].value;
    return ({
      name,
      free: spaces - occupancy
    });
  } catch(e) {
    throw(e);
  }
}

module.exports = fetchData;