const fetch = require('node-fetch');
const moment = require('moment');
const delay = ms => new Promise(res => setTimeout(res, ms));

const getGames = async () => {
    const team_one = { value: "Manchester City" }
    const team_two = { value: "Crystal Palace" }
    const premierLeagueResult = await fetch('https://api.sportradar.us/soccer-t3/eu/en/tournaments/sr:tournament:17/schedule.json?api_key=zhc72qz28j3kmrn8f73zhvmn')
    const premierLeagueJson = await premierLeagueResult.json()

    const now = moment().format();
    const upcomingGames = premierLeagueJson.sport_events.filter((game) => game.scheduled > now);

    const firstGame = upcomingGames.filter((game) => game.competitors[0].name === team_one.value && game.competitors[1].name === team_two.value);

    const matchId = firstGame[0].id;

    await delay(1000);
    const getOdds = await fetch(`https://api.sportradar.us/soccer-t3/eu/en/matches/${matchId}/probabilities.json?api_key=zhc72qz28j3kmrn8f73zhvmn`);

    const jsonOdds = await getOdds.json();

    console.log(jsonOdds.probabilities.markets[0].outcomes);
}

getGames();