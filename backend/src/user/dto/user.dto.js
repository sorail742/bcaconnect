// Représentation d'un utilisateur sûre à renvoyer au client (jamais le hash du mot de passe).
const toSafeUserJson = (user) => {
    const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete json.mot_de_passe;
    return json;
};

module.exports = { toSafeUserJson };
