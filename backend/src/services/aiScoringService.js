const { Order, Wallet, Transaction, Review, User, Certification, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Service Alpha-BCA d'Analyse Prédictive et de Scoring IA (v2.6)
 * Ce service calcule la solvabilité des utilisateurs en croisant plusieurs sources de données.
 */
class AIScoringService {
  
  /**
   * Calcule le score global d'un utilisateur (0 à 100)
   * @param {string} userId
   */
  async calculateGlobalScore(userId) {
    try {
      const results = await Promise.all([
        this.getFinancialScore(userId),
        this.getOperationalScore(userId),
        this.getTrustScore(userId),
        this.getActivityScore(userId)
      ]);

      const [financial, operational, trust, activity] = results;

      // Pondération Alpha-BCA v2.6
      // 40% Finance | 30% Opérationnel | 20% Confiance | 10% Activité
      const globalScore = (financial * 0.4) + (operational * 0.3) + (trust * 0.2) + (activity * 0.1);

      return {
        score: Math.round(globalScore * 10) / 10,
        breakdown: {
          financial,
          operational,
          trust,
          activity
        },
        metadata: {
          analyzed_at: new Date(),
          version: '2.6-alpha',
          status: this.getScoreStatus(globalScore)
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul du score IA:', error);
      throw error;
    }
  }

  /**
   * Score financier (Basé sur le Wallet)
   */
  async getFinancialScore(userId) {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) return 30; // Score de base par défaut

    const balance = parseFloat(wallet.solde_virtuel || 0);
    const pendingBalance = parseFloat(wallet.solde_en_attente || 0);
    
    // Analyse des transactions récentes (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const txCount = await Transaction.count({
      where: {
        portefeuille_id: wallet.id,
        created_at: { [Op.gte]: thirtyDaysAgo },
        statut: 'complété'
      }
    });

    let score = 50; // Neutre
    
    // Bonus de solde
    if (balance > 1000000) score += 10;
    if (balance > 5000000) score += 15;
    
    // Bonus de flux (Liquidité)
    if (txCount > 5) score += 10;
    if (txCount > 20) score += 15;

    // Malus si solde trop bas
    if (balance < 50000) score -= 20;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Opérationnel (Basé sur les commandes)
   */
  async getOperationalScore(userId) {
    const orders = await Order.findAll({
      where: { utilisateur_id: userId },
      attributes: ['statut'],
      limit: 50
    });

    if (orders.length === 0) return 50;

    const completed = orders.filter(o => o.statut === 'payé' || o.statut === 'livré').length;
    const cancelled = orders.filter(o => o.statut === 'annulé').length;
    
    const successRate = (completed / orders.length) * 100;
    
    // On pénalise fortement les annulations
    let score = successRate - (cancelled * 5);
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score de Confiance (Basé sur le profil et les avis)
   */
  async getTrustScore(userId) {
    const user = await User.findByPk(userId);
    const reviews = await Review.findAll({
      where: { utilisateur_id: userId },
      attributes: ['note']
    });

    let score = user?.score_confiance || 70;

    if (reviews.length > 0) {
      const avgNote = reviews.reduce((acc, r) => acc + r.note, 0) / reviews.length;
      score = (score * 0.7) + (avgNote * 20 * 0.3); // Mix entre score interne et avis
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score d'activité (Engagement sur la plateforme)
   */
  async getActivityScore(userId) {
    const user = await User.findByPk(userId);
    if (!user) return 0;

    const daysSinceCreation = Math.max(1, (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    
    let score = Math.min(50, daysSinceCreation * 0.5); // Bonus d'ancienneté

    // Bonus de certification (au moins une certification validée par l'admin)
    const hasValidatedCertification = await Certification.count({
      where: { fournisseur_id: userId, statut: 'validee' },
    }) > 0;
    if (hasValidatedCertification) score += 30;
    if (user.role === 'fournisseur' || user.role === 'admin') score += 20;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Détermine le statut verbal du score
   */
  getScoreStatus(score) {
    if (score >= 85) return 'ÉLITE';
    if (score >= 70) return 'PREMIUM';
    if (score >= 50) return 'STANDARD';
    if (score >= 30) return 'RISQUÉ';
    return 'CRITIQUE';
  }
}

module.exports = new AIScoringService();
