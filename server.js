//set up basic express application server
const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql')
const app = express()

const clubs = [
    {id: 1, name: 'Real Madrid'},
    {id: 2, name: 'Atl Madrid'},
    {id: 3, name: 'Barcelona'},

]

const players = [
    {id:1, name: 'Sergio Ramos', clubId: 1},
    {id:2, name: 'Lionel Messi', clubId: 3},
    {id:3, name: 'Niguez Saul', clubId: 2},

]


const PlayerType = new GraphQLObjectType({
    name: 'player',
    description: 'This describes a single player profile',
    fields: () => ({
        id : { type: GraphQLNonNull(GraphQLInt)},
        name : {type: GraphQLNonNull(GraphQLString)},
        clubId: {type: GraphQLNonNull(GraphQLInt)},
        club: {
            type: ClubType,
            resolve: (player) => {
                return clubs.find(club => club.id === player.clubId)
            }
        }
    })
})


const ClubType = new GraphQLObjectType({
    name: 'club',
    description: 'This describes a single club',
    fields: () => ({
        id : { type: GraphQLNonNull(GraphQLInt)},
        name : {type: GraphQLNonNull(GraphQLString)},
        players: {
            type: GraphQLList(PlayerType),
            resolve: (club) => {
                return players.filter(player => player.clubId === club.id)
            }
        }
    })
})

// create a root query scope where everything is pull down from
const RootQueryType  = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () =>({
        // to get a single record of a player
        player: {
            type: PlayerType,
            description: 'A single player',
            args: {
                id: { type: GraphQLInt}
             },
            resolve: (parent, args) => players.find(player => player.id === args.id)
        },
        // to get a list of all players
        players: {
            type: new GraphQLList(PlayerType),
            description: 'List of all players',
            resolve: () => players
        },
        // to get a single club record
        club:{
            type: ClubType,
            description: 'A single club',
            args:{
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => clubs.find(club => club.id === args.id)
        },
        // to get a list of all clubs
        clubs: {
            type: new GraphQLList(ClubType),
            description: 'List of all clubs',
            resolve: () => clubs
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addPlayer: {
            type: PlayerType,
            description: 'Add a player',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                clubId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const player = {id: players.length + 1, name: args.name, clubId: args.clubId }
                players.push(player)
                return player
            }
        },
        addClub: {
            type: ClubType,
            description: 'Add a club',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const club = {id: clubs.length + 1, name: args.name }
                clubs.push(club)
                return club
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
    
})

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'HelloWorld',
//         fields: ()=> ({
//             message: { 
//                 type: GraphQLString,
//                 resolve: () => 'Hello world!' 
//             }
//         })
//     })
// })

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true //produces an interface for graphql so you dont have to use postman
}))
app.listen(5000., ()=> console.log('Server is running'))