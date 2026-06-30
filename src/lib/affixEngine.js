import affixData from '../../data/affixes.json'

const { rules } = affixData.nasalAssimilation

function applyNasal(root) {
  for (const rule of rules) {
    for (const s of rule.startsWith) {
      if (root.toLowerCase().startsWith(s)) {
        const stem = rule.dropInitial ? root.slice(s.length) : root
        return rule.prefix + stem
      }
    }
  }
  return 'me' + root
}

function applyPeNasal(root) {
  // pe- follows the same assimilation as me- but with pe/pem/pen/peng/peny
  const meForm = applyNasal(root)
  return meForm.replace(/^me/, 'pe')
}

export function deriveForm(root, affixId) {
  switch (affixId) {
    case 'me':     return applyNasal(root)
    case 'ber':    return root.startsWith('r') ? 'be' + root : 'ber' + root
    case 'di':     return 'di' + root
    case 'ter':    return 'ter' + root
    case 'ke':     return 'ke' + root
    case 'se':     return 'se' + root
    case 'pe':     return applyPeNasal(root)
    case 'an':     return root + 'an'
    case 'kan':    return root + 'kan'
    case 'i':      return root + 'i'
    case 'nya':    return root + 'nya'
    case 'lah':    return root + 'lah'
    case 'me_kan': return applyNasal(root) + 'kan'
    case 'me_i':   return applyNasal(root) + 'i'
    case 'pe_an':  return applyPeNasal(root) + 'an'
    case 'ke_an':  return 'ke' + root + 'an'
    case 'ber_an': return (root.startsWith('r') ? 'be' : 'ber') + root + 'an'
    default:       return root
  }
}

export const affixes = affixData.affixes
