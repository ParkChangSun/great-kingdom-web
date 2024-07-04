const translations: Map<string, Map<string, string>> = new Map([
    ["en", new Map([
        ['title', "Great Kingdom Online"],
        ['description', `Great Kingdom simplifies Go
	without taking the fun away for experienced players, making it the perfect gateway into the world of
	Go. It is the first of three games of the game series WIZSTONE, developed by Go grandmaster
	Lee Sedol. You can play Great Kingdom with players worldwide for free.`],

        ["home.main.1", `Building a kingdom is no easy task - more so if your enemy is trying to occupy the same territory.
	Build the biggest kingdom by strategically placing your own castles and destroying the enemy's: a
	single enemy castle is enough to win the game.`],
        ["home.main.2", `Great Kingdom simplifies <a href="https://en.wikipedia.org/wiki/Go_(game)" target="_blank">Go</a>
	without taking the fun away for experienced players, making it the perfect gateway into the world of
	Go. It is the first of three games of the game series WIZSTONE, developed by Go grandmaster
	<a href="https://en.wikipedia.org/wiki/Lee_Sedol" target="_blank">Lee Sedol</a>.`],
        ["home.main.3", "You can play Great Kingdom with players worldwide for free."],

        ["home.howto.1", `To play Great Kingdom, <a href="/user">register</a> an account first. You only need an ID and password.`],
        ["home.howto.2", `Then, go to the <a href="/lobby">lobby</a> and create/join game session.`],

        ["home.rules.title", "Rules"],
        ["home.rules.1", "The 'Neutral Castle' is placed at the middle of the 9x9 board."],
        ["home.rules.2", "Each turn, player can do <b>build</b> a castle or <b>pass</b> the turn."],
        ["home.rules.3", "The player can <b>capture</b> the spaces with its castles, making them its <b>territories</b>."],
        ["home.rules.4", "The player can <b>siege</b> the opponent's castles, and win the game."],
        ["home.rules.5", "If both player passed in a row, or if there's no space on the board, the game will end."],
        ["home.rules.6", "The blue player must capture 3 or more territories than the orange player."],

        ["home.about.1", `"Great Kingdom" is owned by ⓒ KOREA BOARDGAMES worldwide under a contract with Lee Se-dol.`],
        ["home.about.2", "This project is non-profit."],
        ["home.about.3", `If you have Issues/Suggestions, please comment in the <a href="/chat">CHAT</a>`],
    ])],
    ["kr", new Map([
        ['title', "그레이트 킹덤 온라인"],
        ['description', `그레이트 킹덤은 숙련된 플레이어에게 재미를 빼앗기지 않고 바둑을 단순화하여 바둑의 세계로 들어가는 완벽한 관문입니다. 
            바둑 명인 이세돌이 개발한 게임 시리즈 위즈스톤(WIZSTONE)의 세 게임 중 첫 번째 게임입니다. 
            전 세계 플레이어와 함께 그레이트 킹덤을 무료로 플레이할 수 있습니다.`],

        ["home.main.1", `왕국을 건설하는 것은 쉬운 일이 아닙니다 - 만약 당신의 적이 같은 영토를 차지하려고 한다면 더욱 그렇습니다.
전략적으로 자신의 성을 배치하고 적의 성을 파괴하여 가장 큰 왕국을 건설하십시오.
승리하는 데에는 상대의 성 하나만 파괴해도 충분합니다.`],
        ["home.main.2", `그레이트 킹덤은 숙련된 바둑 플레이어에게 즐거움을 빼앗기지 않고 바둑을 단순화하여 <a href="https://en.wikipedia.org/wiki/Go_(game) " target="_blank">바둑</a>
            의 세계로 들어가는 완벽한 관문입니다. 그레이트 킹덤은 <a href="https://en.wikipedia.org/wiki/Lee_Sedol " target="_blank">이세돌</a> 
            9단이 개발한 게임 시리즈 WIZSTONE의 세 게임 중 첫 번째 게임입니다.`],
        ["home.main.3", "전 세계 플레이어와 함께 그레이트 킹덤을 무료로 플레이하세요."],

        ["home.howto.1", `그레이트 킹덤을 플레이하려면 먼저 <a href="/user">계정을 등록</a>하세요. 아이디와 비밀번호만 있으면 됩니다.`],
        ["home.howto.2", `그 다음 <a href="/lobby">로비</a>로 이동하여 게임 세션을 생성하거나 세션에 입장합니다.`],

        ["home.rules.title", "Rules"],
        ["home.rules.1", "'중립성'은 9x9 보드의 중앙에 위치합니다."],
        ["home.rules.2", "플레이어는 각 턴마다 성을 놓거나 턴을 패스할 수 있습니다."],
        ["home.rules.3", "플레이어는 자신의 성으로 영역을 점령하여 자신의 영토로 만들 수 있습니다."],
        ["home.rules.4", "플레이어는 상대의 성을 공성할 수 있으며 공성에 성공하면 게임에서 승리할 수 있습니다."],
        ["home.rules.5", "두 플레이어가 연속으로 패스하거나 보드에 공간이 없으면 게임이 종료됩니다."],
        ["home.rules.6", "파란색 플레이어는 주황색 플레이어보다 3개 이상의 영역을 점령해야 합니다."],

        ["home.rulestitle", ""],
        ["home.about.1", `"그레이트 킹덤"은 작가 이세돌과의 계약에 따라 (주)코리아보드게임즈가 전 세계 독점 판권을 소유하고 있습니다.`],
        ["home.about.2", "이 프로젝트는 수익이 발생하지 않습니다."],
        ["home.about.3", `이슈/제안사항이 있으시면 <a href="/chat">채팅</a>에 남겨주시기 바랍니다.`],
    ])]
])

export default translations