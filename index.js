const fetch = require('node-fetch');
const moment = require('moment');
const Response = require('alexa-response');
const delay = ms => new Promise(res => setTimeout(res, ms));

exports.handler = async (event) => {
    if (event.request.type === "LaunchRequest") {
        console.log("Launching...");
        return Response.ask('Welcome to the Kwiff Odds Checker').build();
    } else {
        const teams = [
            { name: "Liverpool FC", nicknames: ['the kop', 'the reds', 'liverpool'] },
            { name: "Manchester City", nicknames: ['city', 'the citizens', 'man city', 'the sky blues'] },
            { name: "Tottenham Hotspur", nicknames: ['spurs', 'tottenham'] },
            { name: "Chelsea FC", nicknames: ['the blues', 'pensioners', 'blues', 'the pensioners', 'chelsea', 'max\'s wet dream'] },
            { name: "Arsenal FC", nicknames: ['the gunners', 'gooners', 'arsenal', 'gunners'] },
            { name: "Manchester United", nicknames: ['united', 'man united', 'the red devils', 'red devils'] },
            { name: "Wolverhampton Wanderers", nicknames: ['wolves', 'Wolverhampton', 'the wanderers', 'wanderers'] },
            { name: "Everton FC", nicknames: ['the black watch', 'the toffees', 'the school of science', 'the dogs of war', 'the toffee men', 'everton', 'the peoples club'] },
            { name: "West Ham United", nicknames: ['west ham', 'the hammers', 'hammers', 'the irons', 'irons'] },
            { name: "Watford FC", nicknames: ['the hornets', 'hornets', 'watford'] },
            { name: "AFC Bournemouth", nicknames: ['bournemouth', 'cherries', 'the cherries', 'boscombe'] },
            { name: "Leicester City", nicknames: ['the filberts', 'filberts', ' the fossils', 'fossils', 'the foxes', 'foxes', 'leicester'] },
            { name: "Brighton & Hove Albion FC", nicknames: ['the seagulls', 'seagulls', 'albion', 'brighton'] },
            { name: "Newcastle United", nicknames: ['the magpies', 'magpies', 'newcastle', 'the toon', 'toon'] },
            { name: "Crystal Palace", nicknames: ['the eagles', 'eagles', 'the glaziers', 'glaziers', 'palace'] },
            { name: "Cardiff City", nicknames: ['the bluebirds', 'cardiff'] },
            { name: "Southampton FC", nicknames: ['the saints', 'southampton'] },
            { name: "Burnley FC", nicknames: ['the clarets', 'clarets ', 'burnley'] },
            { name: "Huddersfield Town", nicknames: ['the terriers', 'terriers', 'huddersfield'] },
            { name: "Fulham FC", nicknames: ['the cottagers', 'cottagers', 'lilywhites', 'whites', 'the lilywhites', 'the whites', 'fulham'] },
        ]
        const slots = event.request.intent.slots;
        const team_one = slots.team_one.value.toLowerCase();
        console.log('1-SAID:', team_one);
        const team_two = slots.team_two.value.toLowerCase();
        console.log('2-SAID', team_two);

        let actualTeamOneApiName = undefined;
        let actualTeamTwoApiName = undefined;

        teams.forEach((team) => {
            if (team.nicknames.includes(team_one)) {
                actualTeamOneApiName = team.name.toLowerCase();
            }

            if (team.nicknames.includes(team_two)) {
                actualTeamTwoApiName = team.name.toLowerCase();
            }
        });

        if (!actualTeamOneApiName || !actualTeamTwoApiName) {
            return Response.ask('Sorry I couldn\`t hear the two team names!').build();
        }

        const premierLeagueResult = await fetch('https://api.sportradar.us/soccer-t3/eu/en/tournaments/sr:tournament:17/schedule.json?api_key=zhc72qz28j3kmrn8f73zhvmn')
        const premierLeagueJson = await premierLeagueResult.json()

        const now = moment().format();
        const upcomingGames = premierLeagueJson.sport_events.filter((game) => game.scheduled > now);

        const firstGame = upcomingGames.filter(game => {
            const apiHomeTeam = game.competitors[0].name.toLowerCase();
            const apiAwayTeam = game.competitors[1].name.toLowerCase();
            return (apiHomeTeam === actualTeamOneApiName && apiAwayTeam === actualTeamTwoApiName);
        })

        if (!firstGame || !firstGame[0] || !firstGame[0].id) {
            return Response.ask(`Those teams aren\'t playing each other soon, check back later for ${actualTeamOneApiName} vs ${actualTeamTwoApiName}`).build();
        }
        const matchId = firstGame[0].id;

        if (!matchId) {
            return Response.ask('Cannot find a game with those two teams.').build();
        }

        await delay(1000);
        const getOdds = await fetch(`https://api.sportradar.us/soccer-t3/eu/en/matches/${matchId}/probabilities.json?api_key=zhc72qz28j3kmrn8f73zhvmn`);

        const jsonOdds = await getOdds.json();

        if (!jsonOdds || !jsonOdds.probabilities || !Array.isArray(jsonOdds.probabilities.markets)) {
            return Response.ask('Did not recieve any odds.').build();
        }
        const outcomes = jsonOdds.probabilities.markets[0].outcomes;

        return Response.ask(`The odds of ${actualTeamOneApiName} winning vs ${actualTeamTwoApiName} is ${(1 / (outcomes[0].probability / 100)).toFixed(2)}. Get supercharged by joining Kwiff`).build();
    }
}
