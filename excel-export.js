// Fonctionnalités d'exportation Excel pour le calculateur d'impôts

// Fonction pour exporter les résultats en Excel
function exportToExcel() {
    // Vérifier si la bibliothèque SheetJS est chargée
    if (typeof XLSX === 'undefined') {
        // Si la bibliothèque n'est pas chargée, l'ajouter dynamiquement
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = function() {
            // Une fois la bibliothèque chargée, générer le fichier Excel
            generateExcel();
        };
        document.head.appendChild(script);
    } else {
        // Si la bibliothèque est déjà chargée, générer le fichier Excel directement
        generateExcel();
    }
}

// Fonction pour générer le fichier Excel avec SheetJS
function generateExcel() {
    // Créer une notification pour informer l'utilisateur
    showNotification('Génération du fichier Excel en cours...', 'info');
    
    // Récupérer les données du calcul
    const annee = new Date().getFullYear() - 1; // Année fiscale (année précédente)
    const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
    const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
    const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
    const optionDeduction = document.getElementById('option-deduction').value;
    const revenuImposable = document.getElementById('revenu-imposable').textContent;
    const estimationImpot = document.querySelector('#estimation-impot .big-number').textContent;
    
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new();
    
    // Créer les données pour la feuille de revenus
    const revenusData = [
        ['Simulation d\'impôts pour intermittent du spectacle'],
        [`Année fiscale ${annee}`],
        [`Document généré le ${new Date().toLocaleDateString('fr-FR')}`],
        [],
        ['Récapitulatif des revenus'],
        ['Type de revenu', 'Montant (€)'],
        ['Salaire brut (cachets)', salaireBrut.toFixed(2)],
        ['Allocations chômage', allocationChomage.toFixed(2)],
        ['Autres revenus', autresRevenus.toFixed(2)],
        ['Total des revenus', (salaireBrut + allocationChomage + autresRevenus).toFixed(2)],
        [],
        ['Déductions'],
    ];
    
    // Ajouter les informations de déductions
    if (optionDeduction === 'forfait') {
        revenusData.push(['Option choisie', 'Abattement forfaitaire de 10%']);
        const abattement = Math.min((salaireBrut + allocationChomage + autresRevenus) * 0.1, 12829);
        revenusData.push(['Montant de l\'abattement', abattement.toFixed(2)]);
    } else {
        revenusData.push(['Option choisie', 'Frais réels']);
        
        // Frais de transport
        const fraisTransport = parseFloat(document.getElementById('frais-transport').value) || 0;
        if (fraisTransport > 0) {
            revenusData.push(['Frais de transport', fraisTransport.toFixed(2)]);
        }
        
        // Frais de repas
        const fraisRepas = parseFloat(document.getElementById('frais-repas').value) || 0;
        if (fraisRepas > 0) {
            revenusData.push(['Frais de repas', fraisRepas.toFixed(2)]);
        }
        
        // Frais d'hébergement
        const fraisHebergement = parseFloat(document.getElementById('frais-hebergement').value) || 0;
        if (fraisHebergement > 0) {
            revenusData.push(['Frais d\'hébergement', fraisHebergement.toFixed(2)]);
        }
        
        // Frais de matériel
        const fraisMateriel = parseFloat(document.getElementById('frais-materiel').value) || 0;
        if (fraisMateriel > 0) {
            revenusData.push(['Matériel professionnel', fraisMateriel.toFixed(2)]);
        }
        
        // Frais de formation
        const fraisFormation = parseFloat(document.getElementById('frais-formation').value) || 0;
        if (fraisFormation > 0) {
            revenusData.push(['Formation', fraisFormation.toFixed(2)]);
        }
        
        // Frais de documentation
        const fraisDocumentation = parseFloat(document.getElementById('frais-documentation').value) || 0;
        if (fraisDocumentation > 0) {
            revenusData.push(['Documentation', fraisDocumentation.toFixed(2)]);
        }
        
        // Autres frais
        const autresFrais = parseFloat(document.getElementById('autres-frais').value) || 0;
        if (autresFrais > 0) {
            revenusData.push(['Autres frais', autresFrais.toFixed(2)]);
        }
        
        // Total des frais réels
        const totalFraisReels = fraisTransport + fraisRepas + fraisHebergement + fraisMateriel + fraisFormation + fraisDocumentation + autresFrais;
        revenusData.push(['Total des frais réels', totalFraisReels.toFixed(2)]);
    }
    
    // Ajouter les résultats
    revenusData.push([]);
    revenusData.push(['Résultats du calcul']);
    revenusData.push(['Revenu net imposable', revenuImposable.replace(' €', '')]);
    revenusData.push(['Estimation de l\'impôt sur le revenu', estimationImpot.replace(' €', '')]);
    
    // Créer une feuille pour les revenus
    const wsRevenus = XLSX.utils.aoa_to_sheet(revenusData);
    
    // Ajouter des styles (largeur de colonne)
    const wscols = [
        {wch: 30}, // Largeur de la première colonne
        {wch: 15}  // Largeur de la deuxième colonne
    ];
    wsRevenus['!cols'] = wscols;
    
    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(wb, wsRevenus, 'Simulation Impôts');
    
    // Créer une feuille pour les missions si disponibles
    if (typeof missions !== 'undefined' && missions.length > 0) {
        const missionsData = [
            ['Détail des missions et déplacements'],
            [],
            ['Date', 'Description', 'Repas', 'Kilomètres', 'Hébergement', 'Total']
        ];
        
        missions.forEach(mission => {
            missionsData.push([
                mission.date,
                mission.description,
                mission.fraisRepas.toFixed(2),
                `${mission.km} km (${mission.fraisKm.toFixed(2)} €)`,
                mission.hebergement.toFixed(2),
                mission.totalFrais.toFixed(2)
            ]);
        });
        
        const wsMissions = XLSX.utils.aoa_to_sheet(missionsData);
        XLSX.utils.book_append_sheet(wb, wsMissions, 'Missions');
    }
    
    // Créer une feuille pour les factures si disponibles
    if (typeof factures !== 'undefined' && factures.length > 0) {
        const facturesData = [
            ['Détail du matériel professionnel'],
            [],
            ['Date', 'Description', 'Montant', 'Amortissement', 'Déduction annuelle']
        ];
        
        factures.forEach(facture => {
            const deductionAnnuelle = facture.amortissement > 1 ? 
                facture.montant / facture.amortissement : 
                facture.montant;
            
            facturesData.push([
                facture.date,
                facture.description,
                facture.montant.toFixed(2),
                facture.amortissement > 1 ? `${facture.amortissement} ans` : 'Pas d\'amortissement',
                deductionAnnuelle.toFixed(2)
            ]);
        });
        
        const wsFactures = XLSX.utils.aoa_to_sheet(facturesData);
        XLSX.utils.book_append_sheet(wb, wsFactures, 'Matériel');
    }
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `simulation_impots_intermittent_${annee}.xlsx`);
    
    // Afficher une notification de succès
    showNotification('Votre fichier Excel a été généré avec succès !', 'success');
}

// Fonction pour afficher une notification
function showNotification(message, type) {
    // Vérifier si la fonction existe déjà (définie dans export.js)
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Ajouter la notification au document
    document.body.appendChild(notification);
    
    // Afficher la notification avec une animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Masquer et supprimer la notification après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}