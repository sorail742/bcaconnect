const User = require('../user/models/user.model');
const Wallet = require('../common/wallet/models/wallet.model');
const Store = require('../store/models/store.model');
const Product = require('../product/models/product.model');
const ProductImage = require('../product/models/productImage.model');
const Category = require('../category/models/category.model');
const Order = require('../order/models/order.model');
const OrderItem = require('../order/models/orderItem.model');
const Transaction = require('../common/transactions/models/transaction.model');
const AuditLog = require('../audit-log/models/auditLog.model');
const SyncQueue = require('./SyncQueue');
const Publicite = require('../ad/models/publicite.model');
const PubliciteCiblage = require('../ad/models/publiciteCiblage.model');
const PubliciteStat = require('../ad/models/publiciteStat.model');
const PaiementPublicite = require('../ad/models/paiementPublicite.model');
const Litige = require('../dispute/models/litige.model');
const LitigeEvenement = require('../dispute/models/litigeEvenement.model');
const Credit = require('../credit/models/credit.model');
const Echeancier = require('../credit/models/echeancier.model');
const DeliveryLog = require('../delivery/models/deliveryLog.model');
const DeliveryGroup = require('../delivery/models/deliveryGroup.model');
const Ticket = require('../support/models/ticket.model');
const Review = require('../review/models/review.model');
const Notification = require('../notification/models/notification.model');
const Conversation = require('../message/models/conversation.model');
const Message = require('../message/models/message.model');
const ConversationParticipant = require('../message/models/conversationParticipant.model');
const Guarantee = require('../sav/models/guarantee.model');
const Intervention = require('../sav/models/intervention.model');
const EducationalResource = require('../education/models/educationalResource.model');
const EducationalQuiz = require('../education/models/educationalQuiz.model');
const EducationalProgress = require('../education/models/educationalProgress.model');
const IoTTrackingLog = require('../iot/models/iotTrackingLog.model');
const BlockchainTransactionStub = require('../iot/models/blockchainTransactionStub.model');
const AchatGroupe = require('../group-purchase/models/achatGroupe.model');
const AchatGroupeParticipant = require('../group-purchase/models/achatGroupeParticipant.model');
const OtpVerification = require('../auth/models/otpVerification.model');
const Webinar = require('../webinar/models/webinar.model');
const AiConversation = require('../ai/models/aiConversation.model');
const AiMessage = require('../ai/models/aiMessage.model');
const Certification = require('../certification/models/certification.model');
const DeletionLog = require('../deletion-log/models/deletionLog.model');
const RfqRequest = require('../rfq/models/rfqRequest.model');
const RfqQuote = require('../rfq/models/rfqQuote.model');
const ProductQuestion = require('../product-question/models/productQuestion.model');
const Coupon = require('../coupon/models/coupon.model');
const CouponUsage = require('../coupon/models/couponUsage.model');
const ProductVariant = require('../product-variant/models/productVariant.model');
const PartnerStock = require('../partner-stock/models/partnerStock.model');
const RfqLineItem = require('../rfq/models/rfqLineItem.model');
const RfqQuoteLine = require('../rfq/models/rfqQuoteLine.model');
const Organization = require('../organization/models/organization.model');
const OrganizationMember = require('../organization/models/organizationMember.model');
const OrganizationOrderRequest = require('../organization/models/organizationOrderRequest.model');
const AlertThreshold = require('../alert-threshold/models/alertThreshold.model');
const sequelize = require('../config/database');

// 1. Relations Utilisateur - Portefeuille
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'portefeuille' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

// 2. Relations Utilisateur - Boutique
User.hasOne(Store, { foreignKey: 'proprietaire_id', as: 'boutique' });
Store.belongsTo(User, { foreignKey: 'proprietaire_id' });

// 3. Relations Boutique - Produit
Store.hasMany(Product, { foreignKey: 'boutique_id', as: 'produits' });
Product.belongsTo(Store, { foreignKey: 'boutique_id', as: 'boutique' });

// 3bis. Relations Produit - Galerie d'images
Product.hasMany(ProductImage, { foreignKey: 'produit_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'produit_id' });

// 4. Relations Catégorie - Produit
Category.hasMany(Product, { foreignKey: 'categorie_id', as: 'produits' });
Product.belongsTo(Category, { foreignKey: 'categorie_id', as: 'categorie' });

Category.hasMany(Category, { foreignKey: 'parent_id', as: 'sous_categories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// 5. Relations Commandes
User.hasMany(Order, { foreignKey: 'utilisateur_id', as: 'commandes' });
Order.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'client' });
Order.belongsTo(User, { foreignKey: 'transporteur_id', as: 'transporteur' });

Order.hasMany(OrderItem, { foreignKey: 'commande_id', as: 'details' });
OrderItem.belongsTo(Order, { foreignKey: 'commande_id', as: 'commande' });

Product.hasMany(OrderItem, { foreignKey: 'produit_id' });
OrderItem.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

User.hasMany(OrderItem, { foreignKey: 'fournisseur_id', as: 'ventes' });
OrderItem.belongsTo(User, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// 6. Relations Transactions
Wallet.hasMany(Transaction, { foreignKey: 'portefeuille_id', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'portefeuille_id' });

Order.hasOne(Transaction, { foreignKey: 'commande_id' });
Transaction.belongsTo(Order, { foreignKey: 'commande_id' });

// 7. Audit & Sync
User.hasMany(AuditLog, { foreignKey: 'utilisateur_id' });
AuditLog.belongsTo(User, { foreignKey: 'utilisateur_id' });

User.hasMany(SyncQueue, { foreignKey: 'utilisateur_id' });
SyncQueue.belongsTo(User, { foreignKey: 'utilisateur_id' });

// 8. Relations Publicités
Publicite.hasMany(PubliciteCiblage, { foreignKey: 'publicite_id', as: 'ciblages' });
PubliciteCiblage.belongsTo(Publicite, { foreignKey: 'publicite_id' });

Publicite.hasMany(PubliciteStat, { foreignKey: 'publicite_id', as: 'stats' });
PubliciteStat.belongsTo(Publicite, { foreignKey: 'publicite_id' });

Publicite.hasMany(PaiementPublicite, { foreignKey: 'publicite_id', as: 'paiements' });
PaiementPublicite.belongsTo(Publicite, { foreignKey: 'publicite_id' });

User.hasMany(Publicite, { foreignKey: 'vendeur_id', as: 'publicites' });
Publicite.belongsTo(User, { foreignKey: 'vendeur_id', as: 'vendeur' });

User.hasMany(PaiementPublicite, { foreignKey: 'utilisateur_id' });
PaiementPublicite.belongsTo(User, { foreignKey: 'utilisateur_id' });

// 9. Relations Litiges
Order.hasMany(Litige, { foreignKey: 'commande_id', as: 'litiges' });
Litige.belongsTo(Order, { foreignKey: 'commande_id' });

User.hasMany(Litige, { foreignKey: 'demandeur_id', as: 'litiges_ouverts' });
Litige.belongsTo(User, { foreignKey: 'demandeur_id', as: 'demandeur' });

User.hasMany(Litige, { foreignKey: 'defenseur_id', as: 'litiges_contre' });
Litige.belongsTo(User, { foreignKey: 'defenseur_id', as: 'defenseur' });

Litige.hasMany(LitigeEvenement, { foreignKey: 'litige_id', as: 'evenements' });
LitigeEvenement.belongsTo(Litige, { foreignKey: 'litige_id' });
LitigeEvenement.belongsTo(User, { foreignKey: 'auteur_id', as: 'auteur' });

// 10. Relations Crédit & Financement
User.hasMany(Credit, { foreignKey: 'utilisateur_id', as: 'credits' });
Credit.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

Order.hasOne(Credit, { foreignKey: 'commande_id' });
Credit.belongsTo(Order, { foreignKey: 'commande_id' });

Credit.hasMany(Echeancier, { foreignKey: 'credit_id', as: 'echeances' });
Echeancier.belongsTo(Credit, { foreignKey: 'credit_id' });

// 11. Relations Transport & Tracking (Phase 10)
Order.hasMany(DeliveryLog, { foreignKey: 'order_id', as: 'tracking_history' });
DeliveryLog.belongsTo(Order, { foreignKey: 'order_id' });

DeliveryGroup.hasMany(Order, { foreignKey: 'delivery_group_id', as: 'commandes' });
Order.belongsTo(DeliveryGroup, { foreignKey: 'delivery_group_id', as: 'delivery_group' });

// 12. Relations SAV & Feedback (Phase 12)
User.hasMany(Ticket, { foreignKey: 'utilisateur_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'utilisateur_id' });

Order.hasMany(Ticket, { foreignKey: 'commande_id' });
Ticket.belongsTo(Order, { foreignKey: 'commande_id' });

Product.hasMany(Review, { foreignKey: 'produit_id', as: 'avis' });
Review.belongsTo(Product, { foreignKey: 'produit_id' });

User.hasMany(Review, { foreignKey: 'utilisateur_id' });
Review.belongsTo(User, { foreignKey: 'utilisateur_id' });

User.hasMany(Notification, { foreignKey: 'utilisateur_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'utilisateur_id' });

// 13. Relations SAV & Garanties
User.hasMany(Guarantee, { foreignKey: 'acheteur_id', as: 'garanties' });
Guarantee.belongsTo(User, { foreignKey: 'acheteur_id' });

Product.hasMany(Guarantee, { foreignKey: 'produit_id' });
Guarantee.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

Order.hasMany(Guarantee, { foreignKey: 'commande_id' });
Guarantee.belongsTo(Order, { foreignKey: 'commande_id' });

Guarantee.hasMany(Intervention, { foreignKey: 'guarantee_id', as: 'interventions' });
Intervention.belongsTo(Guarantee, { foreignKey: 'guarantee_id' });

Product.hasMany(Intervention, { foreignKey: 'produit_id' });
Intervention.belongsTo(Product, { foreignKey: 'produit_id' });

User.hasMany(Intervention, { foreignKey: 'demandeur_id', as: 'demandes_intervention' });
Intervention.belongsTo(User, { foreignKey: 'demandeur_id', as: 'demandeur' });

User.hasMany(Intervention, { foreignKey: 'technicien_id', as: 'interventions_assignees' });
Intervention.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });

// 14. Relations IoT & Blockchain (Stubs)
Order.hasMany(IoTTrackingLog, { foreignKey: 'commande_id', as: 'iot_logs' });
IoTTrackingLog.belongsTo(Order, { foreignKey: 'commande_id' });

Order.hasMany(BlockchainTransactionStub, { foreignKey: 'commande_id', as: 'smart_contracts' });
BlockchainTransactionStub.belongsTo(Order, { foreignKey: 'commande_id' });

// ── Relations Conversations & Messages ───────────────────────────────
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'user_id', as: 'conversations' });
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversation_id', as: 'participants' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

User.hasMany(Message, { foreignKey: 'expediteur_id', as: 'messages_envoyes' });
Message.belongsTo(User, { foreignKey: 'expediteur_id', as: 'expediteur' });

ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id' });
ConversationParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'utilisateur' });
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'details_participants' });

// 15. Achats groupés (ONG / B2B)
User.hasMany(AchatGroupe, { foreignKey: 'organisateur_id', as: 'campagnes_organisees' });
AchatGroupe.belongsTo(User, { foreignKey: 'organisateur_id', as: 'organisateur' });

Product.hasMany(AchatGroupe, { foreignKey: 'produit_id', as: 'achats_groupes' });
AchatGroupe.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

AchatGroupe.hasMany(AchatGroupeParticipant, { foreignKey: 'achat_groupe_id', as: 'participants' });
AchatGroupeParticipant.belongsTo(AchatGroupe, { foreignKey: 'achat_groupe_id', as: 'campagne' });

User.hasMany(AchatGroupeParticipant, { foreignKey: 'utilisateur_id', as: 'participations_groupe' });
AchatGroupeParticipant.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'participant' });

Order.hasOne(AchatGroupeParticipant, { foreignKey: 'commande_id' });
AchatGroupeParticipant.belongsTo(Order, { foreignKey: 'commande_id', as: 'commande' });

// 16. Conversations IA (BCA Assistant) & historique
User.hasMany(AiConversation, { foreignKey: 'user_id', as: 'ai_conversations' });
AiConversation.belongsTo(User, { foreignKey: 'user_id' });

AiConversation.hasMany(AiMessage, { foreignKey: 'conversation_id', as: 'messages' });
AiMessage.belongsTo(AiConversation, { foreignKey: 'conversation_id' });

// 17. Certifications fournisseurs (6.5)
User.hasMany(Certification, { foreignKey: 'fournisseur_id', as: 'certifications' });
Certification.belongsTo(User, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// 18. Historique infini des suppressions (preuve admin)
DeletionLog.belongsTo(User, { foreignKey: 'supprime_par', as: 'auteur' });
DeletionLog.belongsTo(User, { foreignKey: 'restaure_par', as: 'restaurateur' });

// 19. Formation interactive : quiz & progression (BCA Academy)
EducationalResource.hasOne(EducationalQuiz, { foreignKey: 'resource_id', as: 'quiz' });
EducationalQuiz.belongsTo(EducationalResource, { foreignKey: 'resource_id' });

EducationalResource.hasMany(EducationalProgress, { foreignKey: 'resource_id', as: 'progressions' });
EducationalProgress.belongsTo(EducationalResource, { foreignKey: 'resource_id', as: 'ressource' });

User.hasMany(EducationalProgress, { foreignKey: 'utilisateur_id', as: 'progression_academy' });
EducationalProgress.belongsTo(User, { foreignKey: 'utilisateur_id' });

// 20. RFQ — Demandes de devis (B2B, style Alibaba)
User.hasMany(RfqRequest, { foreignKey: 'utilisateur_id', as: 'demandes_devis' });
RfqRequest.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'demandeur' });

Category.hasMany(RfqRequest, { foreignKey: 'categorie_id', as: 'demandes_devis' });
RfqRequest.belongsTo(Category, { foreignKey: 'categorie_id', as: 'categorie' });

RfqRequest.hasMany(RfqQuote, { foreignKey: 'demande_id', as: 'devis' });
RfqQuote.belongsTo(RfqRequest, { foreignKey: 'demande_id', as: 'demande' });

User.hasMany(RfqQuote, { foreignKey: 'fournisseur_id', as: 'devis_soumis' });
RfqQuote.belongsTo(User, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// 20b. RFQ multi-lignes — appel d'offres projet (analyse concurrentielle #10)
RfqRequest.hasMany(RfqLineItem, { foreignKey: 'demande_id', as: 'lignes' });
RfqLineItem.belongsTo(RfqRequest, { foreignKey: 'demande_id', as: 'demande' });

RfqQuote.hasMany(RfqQuoteLine, { foreignKey: 'devis_id', as: 'lignes' });
RfqQuoteLine.belongsTo(RfqQuote, { foreignKey: 'devis_id', as: 'devis' });
RfqLineItem.hasMany(RfqQuoteLine, { foreignKey: 'ligne_id', as: 'reponses' });
RfqQuoteLine.belongsTo(RfqLineItem, { foreignKey: 'ligne_id', as: 'ligne' });

// 21. Questions/Réponses produit (Q&A style Amazon)
Product.hasMany(ProductQuestion, { foreignKey: 'produit_id', as: 'questions' });
ProductQuestion.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

User.hasMany(ProductQuestion, { foreignKey: 'utilisateur_id', as: 'questions_posees' });
ProductQuestion.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'auteur' });
ProductQuestion.belongsTo(User, { foreignKey: 'repondu_par', as: 'repondant' });

// 22. Coupons / codes promo
User.hasMany(Coupon, { foreignKey: 'createur_id', as: 'coupons_crees' });
Coupon.belongsTo(User, { foreignKey: 'createur_id', as: 'createur' });

Store.hasMany(Coupon, { foreignKey: 'boutique_id', as: 'coupons' });
Coupon.belongsTo(Store, { foreignKey: 'boutique_id', as: 'boutique' });

Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

User.hasMany(CouponUsage, { foreignKey: 'utilisateur_id', as: 'coupons_utilises' });
CouponUsage.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

Order.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

// 23. Variantes produit (taille, couleur, etc.)
Product.hasMany(ProductVariant, { foreignKey: 'produit_id', as: 'variantes' });
ProductVariant.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

OrderItem.belongsTo(ProductVariant, { foreignKey: 'variante_id', as: 'variante' });

// 24. Stock partenaire / entrepôt tiers (cahier des charges 2.5)
Product.hasMany(PartnerStock, { foreignKey: 'produit_id', as: 'stocks_partenaires' });
PartnerStock.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

// 25. Comptes entreprise multi-utilisateurs (analyse concurrentielle #2)
User.hasMany(Organization, { foreignKey: 'proprietaire_id', as: 'organisations_possedees' });
Organization.belongsTo(User, { foreignKey: 'proprietaire_id', as: 'proprietaire' });

Organization.hasMany(OrganizationMember, { foreignKey: 'organization_id', as: 'membres' });
OrganizationMember.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organisation' });
User.hasMany(OrganizationMember, { foreignKey: 'user_id', as: 'appartenances_organisation' });
OrganizationMember.belongsTo(User, { foreignKey: 'user_id', as: 'utilisateur' });

Organization.hasMany(OrganizationOrderRequest, { foreignKey: 'organization_id', as: 'demandes_achat' });
OrganizationOrderRequest.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organisation' });
User.hasMany(OrganizationOrderRequest, { foreignKey: 'demandeur_id', as: 'demandes_achat_soumises' });
OrganizationOrderRequest.belongsTo(User, { foreignKey: 'demandeur_id', as: 'demandeur' });
OrganizationOrderRequest.belongsTo(Order, { foreignKey: 'commande_id', as: 'commande' });

// 26. Seuils d'alerte dynamiques (cahier des charges 3.6)
User.hasMany(AlertThreshold, { foreignKey: 'utilisateur_id', as: 'seuils_alerte' });
AlertThreshold.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'utilisateur' });
Product.hasMany(AlertThreshold, { foreignKey: 'produit_id', as: 'seuils_alerte' });
AlertThreshold.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

module.exports = {
    User,
    Wallet,
    Store,
    Product,
    ProductImage,
    Category,
    Order,
    OrderItem,
    Transaction,
    AuditLog,
    SyncQueue,
    Publicite,
    PubliciteCiblage,
    PubliciteStat,
    PaiementPublicite,
    Litige,
    LitigeEvenement,
    Credit,
    Echeancier,
    DeliveryLog,
    DeliveryGroup,
    Ticket,
    Review,
    Notification,
    Conversation,
    Message,
    ConversationParticipant,
    Guarantee,
    Intervention,
    EducationalResource,
    IoTTrackingLog,
    BlockchainTransactionStub,
    AchatGroupe,
    AchatGroupeParticipant,
    OtpVerification,
    Webinar,
    AiConversation,
    AiMessage,
    Certification,
    DeletionLog,
    EducationalQuiz,
    EducationalProgress,
    RfqRequest,
    RfqQuote,
    RfqLineItem,
    RfqQuoteLine,
    ProductQuestion,
    Coupon,
    CouponUsage,
    ProductVariant,
    PartnerStock,
    Organization,
    OrganizationMember,
    OrganizationOrderRequest,
    AlertThreshold,
    sequelize
};
