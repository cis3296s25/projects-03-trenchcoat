![image](https://github.com/user-attachments/assets/cd51fd84-74fe-4a52-9065-048a00acdae4)

Aim to create a **client-server web application** where multiple users on individual 
devices can simultaneously collaborate on responding to prompts, _similar to Jackbox Party Games_. 
Will be developing using several web-based programming languages like **JavaScript**, 
as well as learning about new technologies such as **WebSocket** protocols to create real-time server connections.

[Proof of concept](https://github.com/zantuaw09/party-game-concept)

## Project Abstract
This is a proposed project for an online party game application where players are assigned a word or phrase. 
The player is then required to draw out this word or sentence. Players can join a lobby on their personal computers
or mobile devices, which can be created and managed by a lobby host. Once the game is started, a player is given a word 
or a phrase, this player must draw out the assigned word or phrase and all of the other players in the game are supposed 
to guess what the drawing is. Whoever guesses correctly first is awarded the points. This loops until all players have gone.

### High Level Requirement
Upon opening the application, users will be able to either create a lobby or join a pre-existing one;
if the player creates a lobby, they will be granted "Host" abilities to share the code associated with
the server and start the game. If a player instead chooses to join a lobby, they will be prompted to
enter a code designated to the desired lobby.

## Conceptual Design
This project calls for two major areas of development: the server connection,
and internal gameplay mechanics. For a game to begin, a user on an individual 
device must first host a unique online server, which allows other users to 
join under the same server connection.

## Required Resources
This project will not require any outstanding hardware or other physical resources, 
but some background information and skills will need to be acquired to best develop 
all the necessary software components of the application. Foremost, some time will 
be spent gaining a working knowledge of client-server architecture and learning how 
to use tools such as a WebSocket protocol to create functional, dynamic connections 
between a user on their web browser and a created server.

## Background & References
The concept of this web application was inspired by a few open-source multiplayer 
party games found on GitHub. Two previous Software Design projects stood out in 
particular: one which recreated the classic party game “Mafia”, and another uniquely 
designed trivia game called “OTTOMH”, both cited below. Each leveraged a client-server
model to provide individual player devices interactive and dynamic features, including 
unique player voting mechanics and real-time score/win condition management. As mentioned
in the “Conceptual Design” section, these applications’ uses of web servers will be primary
inspirations for this project’s online capabilities, with any reused source code being properly 
credited and revised. Anticipated areas of these projects that may be referenced in the future include
its implementation of server lobby settings (creating, joining, and starting games) and any
game properties synchronized between devices (game timers, shared prompts, etc.).

### References / Similar Projects
https://github.com/cis3296f24/applebaum-final-projects-mafia-uhh<br/>
https://github.com/cis3296f22/ottomh.git
