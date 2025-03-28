// Barèmes kilométriques et frais de repas pour les intermittents du spectacle

// Barème kilométrique 2023 (source: impôts.gouv.fr)
const baremeKilometrique = {
    // Voitures
    voitures: [
        { puissance: "3 CV et moins", bareme: { jusqua5000: 0.456, au_dela: 0.273 } },
        { puissance: "4 CV", bareme: { jusqua5000: 0.523, au_dela: 0.294 } },
        { puissance: "5 CV", bareme: { jusqua5000: 0.548, au_dela: 0.308 } },
        { puissance: "6 CV", bareme: { jusqua5000: 0.574, au_dela: 0.323 } },
        { puissance: "7 CV et plus", bareme: { jusqua5000: 0.601, au_dela: 0.340 } }
    ],
    
    // Motos
    motos: [
        { puissance: "Jusqu'à 50 cm³", bareme: { jusqua2000: 0.375, de2001a5000: 0.094, au_dela: 0.063 } },
        { puissance: "De 50 cm³ à 125 cm³", bareme: { jusqua2000: 0.486, de2001a5000: 0.136, au_dela: 0.083 } },
        { puissance: "Plus de 125 cm³", bareme: { jusqua3000: 0.635, de3001a6000: 0.399, au_dela: 0.235 } }
    ],
    
    // Scooters et vélomoteurs
    scooters: [
        { puissance: "Cylindrée <= 50 cm³", bareme: { jusqua2000: 0.375, de2001a5000: 0.094, au_dela: 0.063 } }
    ],
    
    // Calcul du barème kilométrique pour les voitures
    calculVoiture: function(puissanceFiscale, kilometres) {
        // Trouver le barème correspondant à la puissance fiscale
        const bareme = this.voitures.find(item => item.puissance === puissanceFiscale);
        if (!bareme) return 0;
        
        // Calcul selon le barème
        if (kilometres <= 5000) {
            return kilometres * bareme.bareme.jusqua5000;
        } else {
            return 5000 * bareme.bareme.jusqua5000 + (kilometres - 5000) * bareme.bareme.au_dela;
        }
    },
    
    // Calcul du barème kilométrique pour les motos
    calculMoto: function(puissanceFiscale, kilometres) {
        // Trouver le barème correspondant à la puissance fiscale
        const bareme = this.motos.find(item => item.puissance === puissanceFiscale);
        if (!bareme) return 0;
        
        // Calcul selon le barème
        if (kilometres <= 2000) {
            return kilometres * bareme.bareme.jusqua2000;
        } else if (kilometres <= 5000) {
            return 2000 * bareme.bareme.jusqua2000 + (kilometres - 2000) * bareme.bareme.de2001a5000;
        } else {
            return 2000 * bareme.bareme.jusqua2000 + 3000 * bareme.bareme.de2001a5000 + (kilometres - 5000) * bareme.bareme.au_dela;
        }
    },
    
    // Calcul du barème kilométrique pour les scooters
    calculScooter: function(kilometres) {
        const bareme = this.scooters[0]; // Il n'y a qu'une seule catégorie pour les scooters
        
        // Calcul selon le barème
        if (kilometres <= 2000) {
            return kilometres * bareme.bareme.jusqua2000;
        } else if (kilometres <= 5000) {
            return 2000 * bareme.bareme.jusqua2000 + (kilometres - 2000) * bareme.bareme.de2001a5000;
        } else {
            return 2000 * bareme.bareme.jusqua2000 + 3000 * bareme.bareme.de2001a5000 + (kilometres - 5000) * bareme.bareme.au_dela;
        }
    }
};

// Frais de repas 2023 pour les intermittents
const fraisRepas = {
    // Valeurs forfaitaires pour les frais de repas
    valeurs: {
        repasAuRestaurant: 19.40, // Repas au restaurant
        repasSurLieuDeTravail: 9.90, // Repas sur le lieu de travail
        repasDeplacement: 9.90 // Repas lors d'un déplacement
    },
    
    // Calcul des frais de repas selon le type
    calculRepas: function(typeRepas, nombreRepas) {
        return this.valeurs[typeRepas] * nombreRepas;
    }
};

// Exporter les barèmes pour utilisation dans d'autres fichiers
const Baremes = {
    kilometrique: baremeKilometrique,
    repas: fraisRepas
};