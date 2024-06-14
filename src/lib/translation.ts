const translations: Map<string, Map<string, string>> = new Map([
    ["en", new Map([
        ["home.rules.title", "Rules"],
        ["home.rules.1", "The 'Neutral Castle' is placed at the middle of the 9x9 board."],
        ["home.rules.2", "Each turn, player can do <b>build</b> a castle or <b>pass</b> the turn."],
        ["home.rules.3", "The player can <b>capture</b> the spaces with its castles, making them its <b>territories</b>."],
        ["home.rules.4", "The player can <b>siege</b> the opponent's castles, and win the game."],
        ["home.rules.5", "If both player passed in a row, or if there's no space on the board, the game will end."],
        ["home.rules.6", "The blue player must capture 3 or more territories than the orange player."],
        ["home.issues", "If you have Issues/Suggestions, please comment in the"]
    ])],
    ["kr", new Map([
        ["home.rulestitle", ""]
    ])]
])

export default translations