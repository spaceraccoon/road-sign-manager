const axios = require('axios');

async function fetchData(garageId) {
  try {
    let response = await axios.get(
      `https://my.smarking.net/api/users/v1/garages/id/${garageId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SMARKING_KEY}`,
        },
      },
    );
    const { spaces } = response.data;
    const { name } = response.data;
    response = await axios.get(
      `https://my.smarking.net/api/ds/v3/garages/${garageId}/current/occupancy`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SMARKING_KEY}`,
        },
      },
    );
    const occupancy = response.data.value[0].value;
    return {
      name,
      free: spaces - occupancy,
    };
  } catch (e) {
    throw e;
  }
}

module.exports = fetchData;
