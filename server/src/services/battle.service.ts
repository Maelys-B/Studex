import { BOTS } from '../battle/bots/index.js'
import type { Participant } from '../battle/room.js'
import { buildSetup, randomLineup, toBattleCards } from '../battle/setup.js'
import { BattleError } from '../errors/BattleError.js'
import { cardRepository } from '../repositories/card.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import type { Lineup } from '../shared/protocol.js'
import { TALENTS, type Talent } from '../shared/talent.js'

const TALENT_LIST = Object.keys(TALENTS) as Talent[]

export const battleService = {
    async preparedBotBattle(userId: number, botId: string, lineup: Lineup): Promise<[Participant, Participant]> {
        const bot = BOTS.get(botId)
        if (!bot) throw new BattleError('UNKNOWN_BOT', 'Bot inconnu')

        const [user, studentCard, owned, allBattleCards] = await Promise.all([
            userRepository.findUsername(userId),
            cardRepository.findByCreator(userId),
            cardRepository.findOwnedBattleCards(userId),
            cardRepository.findBattleCards()
        ])

        if (!user) throw new BattleError('UNAUTHORIZED', 'Veuillez vous reconnecter')
        if (!studentCard?.talent || studentCard.status === 'rejected') {
            throw new BattleError('NOT_READY', 'Crée ta carte étudiante et choisis un talent pour combattre')
        }

        const setup = buildSetup(userId, studentCard.talent, toBattleCards(owned), lineup, Math.random)
        if (typeof setup === 'string') throw new BattleError('INVALID_LINEUP', setup)

        const botCards = toBattleCards(allBattleCards)
        const botLineup = randomLineup(botCards, Math.random)
        const botTalent = TALENT_LIST[Math.floor(Math.random() * TALENT_LIST.length)]
        const botSetup = botLineup && buildSetup(bot.userId, botTalent, botCards, botLineup, Math.random)
        if (!botSetup || typeof botSetup === 'string') throw new Error('Pas assez de cartes de combat pour le bot')
        
        return [
            { kind: 'human', name: user.username, setup },
            { kind: 'bot', name: bot.name, setup: botSetup, chooseAction: bot.chooseAction }
        ]
    }
}