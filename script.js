document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let missions = [];
    let factures = [];
    
    // Gestion des onglets principaux
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Gestion des boutons Suivant/Précédent
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const nextTabId = this.getAttribute('data-next');
            
            // Si on passe à l'onglet résultats, calculer les impôts
            if (nextTabId === 'resultats') {
                calculerImpots();
            }
            
            // Désactiver tous les onglets
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activer l'onglet suivant
            document.querySelector(`[data-tab="${nextTabId}"]`).classList.add('active');
            document.getElementById(nextTabId).classList.add('active');
        });
    });
    
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const prevTabId = this.getAttribute('data-prev');
            
            // Désactiver tous les onglets
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activer l'onglet précédent
            document.querySelector(`[data-tab="${prevTabId}"]`).classList.add('active');
            document.getElementById(prevTabId).classList.add('active');
        });
    });
    
    // Gestion de l'option de déduction
    const optionDeduction = document.getElementById('option-deduction');
    const sectionFraisReels = document.getElementById('section-frais-reels');
    
    optionDeduction.addEventListener('change', function() {
        if (this.value === 'reels') {
            sectionFraisReels.classList.remove('hidden');
        } else {
            sectionFraisReels.classList.add('hidden');
        }
    });
    
    // Bouton d'impression
    const btnImprimer = document.getElementById('btn-imprimer');
    btnImprimer.addEventListener('click', function() {
        window.print();
    });
    
    // Bouton de réinitialisation
    const btnReset = document.getElementById('btn-reset');
    btnReset.addEventListener('click', function() {
        // Réinitialiser les formulaires
        document.getElementById('revenus-form').reset();
        document.getElementById('frais-form').reset();
        
        // Réinitialiser les missions et factures
        missions = [];
        factures = [];
        
        // Mettre à jour l'affichage
        afficherMissions();
        afficherFactures();
        
        // Revenir à l'onglet revenus
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        document.querySelector('[data-tab="revenus"]').classList.add('active');
        document.getElementById('revenus').classList.add('active');
    });
    
    // Modification du HTML pour ajouter les sections de missions et factures
    modifierHTML();
    
    // Initialiser les gestionnaires d'événements pour les nouvelles sections
    initialiserGestionnaires();
    
    // Fonction pour calculer les impôts
    function calculerImpots() {
        // Récupérer les valeurs des revenus
        const salaireBrut = parseFloat(document.getElementById('salaire-brut').value) || 0;
        const allocationChomage = parseFloat(document.getElementById('allocations-chomage').value) || 0;
        const autresRevenus = parseFloat(document.getElementById('autres-revenus').value) || 0;
        
        // Calculer le total des revenus
        const totalRevenus = salaireBrut + allocationChomage + autresRevenus;
        
        // Récupérer l'option de déduction
        const optionDeduction = document.getElementById('option-deduction').value;
        
        let totalDeductions = 0;
        let detailDeductions = '';
        
        if (optionDeduction === 'forfait') {
            // Abattement forfaitaire de 10%
            totalDeductions = Math.min(totalRevenus * 0.1, 12829); // Plafond 2023
            detailDeductions = `<p>Abattement forfaitaire de 10% : ${totalDeductions.toFixed(2)} €</p>`;
        } else {
            // Calcul des frais réels
            // Récupérer les frais de missions
            let totalFraisMissions = 0;
            missions.forEach(mission => {
                totalFraisMissions += mission.totalFrais;
            });
            
            // Récupérer les frais de matériel (factures)
            let totalFraisFactures = 0;
            factures.forEach(facture => {
                // Si la facture est amortie, on ne prend que la part de l'année
                if (facture.amortissement > 1) {
                    totalFraisFactures += facture.montant / facture.amortissement;
                } else {
                    totalFraisFactures += facture.montant;
                }
            });
            
            // Autres frais professionnels
            const fraisFormation = parseFloat(document.getElementById('frais-formation').value) || 0;
            const fraisDocumentation = parseFloat(document.getElementById('frais-documentation').value) || 0;
            const autresFrais = parseFloat(document.getElementById('autres-frais').value) || 0;
            
            // Total des frais réels
            totalDeductions = totalFraisMissions + totalFraisFactures + fraisFormation + fraisDocumentation + autresFrais;
            
            // Détail des déductions
            detailDeductions = `
                <p>Frais de missions (repas, transport, hébergement) : ${totalFraisMissions.toFixed(2)} €</p>
                <p>Matériel professionnel : ${totalFraisFactures.toFixed(2)} €</p>
                <p>Formation : ${fraisFormation.toFixed(2)} €</p>
                <p>Documentation : ${fraisDocumentation.toFixed(2)} €</p>
                <p>Autres frais : ${autresFrais.toFixed(2)} €</p>
                <p><strong>Total des frais réels : ${totalDeductions.toFixed(2)} €</strong></p>
            `;
        }
        
        // Calculer le revenu imposable
        const revenuImposable = totalRevenus - totalDeductions;
        
        // Estimation simplifiée de l'impôt (barème 2023)
        let impot = 0;
        let detailCalculImpot = '<div class="section-explicative"><h4>Détail du calcul de votre impôt</h4>';
        
        // Calcul par tranches avec explications
        if (revenuImposable <= 10777) {
            impot = 0;
            detailCalculImpot += `<p>Votre revenu imposable (${revenuImposable.toFixed(2)} €) est inférieur à 10 777 €, vous n'êtes donc pas imposable.</p>`;
        } else {
            // Tranche 1 : 0%
            detailCalculImpot += `<div class="etape-calcul"><span class="numero">1</span> <strong>Tranche à 0%</strong> : 0 € (sur les premiers 10 777 €)</div>`;
            
            // Tranche 2 : 11%
            if (revenuImposable > 10777) {
                const montantTranche2 = Math.min(revenuImposable, 27478) - 10777;
                const impotTranche2 = montantTranche2 * 0.11;
                impot += impotTranche2;
                detailCalculImpot += `<div class="etape-calcul"><span class="numero">2</span> <strong>Tranche à 11%</strong> : ${impotTranche2.toFixed(2)} € (11% sur ${montantTranche2.toFixed(2)} €)</div>`;
            }
            
            // Tranche 3 : 30%
            if (revenuImposable > 27478) {
                const montantTranche3 = Math.min(revenuImposable, 78570) - 27478;
                const impotTranche3 = montantTranche3 * 0.30;
                impot += impotTranche3;
                detailCalculImpot += `<div class="etape-calcul"><span class="numero">3</span> <strong>Tranche à 30%</strong> : ${impotTranche3.toFixed(2)} € (30% sur ${montantTranche3.toFixed(2)} €)</div>`;
            }
            
            // Tranche 4 : 41%
            if (revenuImposable > 78570) {
                const montantTranche4 = Math.min(revenuImposable, 168994) - 78570;
                const impotTranche4 = montantTranche4 * 0.41;
                impot += impotTranche4;
                detailCalculImpot += `<div class="etape-calcul"><span class="numero">4</span> <strong>Tranche à 41%</strong> : ${impotTranche4.toFixed(2)} € (41% sur ${montantTranche4.toFixed(2)} €)</div>`;
            }
            
            // Tranche 5 : 45%
            if (revenuImposable > 168994) {
                const montantTranche5 = revenuImposable - 168994;
                const impotTranche5 = montantTranche5 * 0.45;
                impot += impotTranche5;
                detailCalculImpot += `<div class="etape-calcul"><span class="numero">5</span> <strong>Tranche à 45%</strong> : ${impotTranche5.toFixed(2)} € (45% sur ${montantTranche5.toFixed(2)} €)</div>`;
            }
        }
        
        detailCalculImpot += `<p class="formule"><strong>Total de l'impôt</strong> = ${impot.toFixed(2)} €</p></div>`;
        
        // Afficher les résultats
        // Récapitulatif des revenus
        document.getElementById('recap-revenus').innerHTML = `
            <table>
                <tr>
                    <td>Salaire brut (cachets)</td>
                    <td class="montant">${salaireBrut.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>Allocations chômage</td>
                    <td class="montant">${allocationChomage.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>Autres revenus</td>
                    <td class="montant">${autresRevenus.toFixed(2)} €</td>
                </tr>
                <tr class="total">
                    <td><strong>Total des revenus</strong></td>
                    <td class="montant"><strong>${totalRevenus.toFixed(2)} €</strong></td>
                </tr>
            </table>
        `;
        
        // Déductions
        document.getElementById('recap-deductions').innerHTML = detailDeductions;
        
        // Revenu imposable
        document.getElementById('revenu-imposable').textContent = `${revenuImposable.toFixed(2)} €`;
        
        // Estimation de l'impôt
        document.getElementById('estimation-impot').innerHTML = `
            <p class="big-number">${impot.toFixed(2)} €</p>
            <p>Taux d'imposition moyen : ${((impot / revenuImposable) * 100).toFixed(2)}%</p>
            ${detailCalculImpot}
        `;
        
        // Aide pour la déclaration
        document.getElementById('aide-declaration').innerHTML = `
            <table>
                <tr>
                    <th>Case</th>
                    <th>Montant</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td>1AJ</td>
                    <td>${salaireBrut.toFixed(2)} €</td>
                    <td>Salaires, cachets</td>
                </tr>
                <tr>
                    <td>1AP</td>
                    <td>${allocationChomage.toFixed(2)} €</td>
                    <td>Allocations chômage</td>
                </tr>
                ${optionDeduction === 'reels' ? `
                <tr>
                    <td>1AK</td>
                    <td>${totalDeductions.toFixed(2)} €</td>
                    <td>Frais réels</td>
                </tr>` : ''}
            </table>
            <p class="info-box">N'oubliez pas de joindre une note détaillée de vos frais réels à votre déclaration si vous optez pour cette déduction.</p>
        `;
    }
    
    // Fonction pour modifier le HTML et ajouter les sections de missions et factures
    function modifierHTML() {
        // Ajouter la section des missions dans l'onglet Frais Réels
        const sectionFraisReels = document.getElementById('section-frais-reels');
        
        // Créer la section des missions
        const sectionMissions = document.createElement('div');
        sectionMissions.id = 'section-missions';
        sectionMissions.innerHTML = `
            <h3>Détail des missions et déplacements</h3>
            <div class="info-box">
                <p>Ajoutez ici vos missions et déplacements pour calculer automatiquement vos frais de repas et de transport.</p>
            </div>
            
            <div class="form-group">
                <label for="mission-date">Date de la mission :</label>
                <input type="date" id="mission-date" name="mission-date">
            </div>
            
            <div class="form-group">
                <label for="mission-description">Description :</label>
                <input type="text" id="mission-description" name="mission-description" placeholder="Ex: Tournage, Concert, etc.">
            </div>
            
            <div class="form-group">
                <label for="mission-repas">Nombre de repas :</label>
                <input type="number" id="mission-repas" name="mission-repas" min="0" value="0">
            </div>
            
            <div class="form-group">
                <label for="mission-type-repas">Type de repas :</label>
                <select id="mission-type-repas" name="mission-type-repas">
                    <option value="repasAuRestaurant">Repas au restaurant (19.40€)</option>
                    <option value="repasSurLieuDeTravail">Repas sur lieu de travail (9.90€)</option>
                    <option value="repasDeplacement">Repas en déplacement (9.90€)</option>
                </select>
                <small>Selon barème fiscal 2023</small>
            </div>
            
            <div class="form-group">
                <label for="mission-km">Kilomètres parcourus :</label>
                <input type="number" id="mission-km" name="mission-km" min="0" value="0">
            </div>
            
            <div class="form-group">
                <label for="mission-type-vehicule">Type de véhicule :</label>
                <select id="mission-type-vehicule" name="mission-type-vehicule">
                    <option value="voiture">Voiture</option>
                    <option value="moto">Moto</option>
                    <option value="scooter">Scooter/Vélomoteur</option>
                </select>
            </div>
            
            <div class="form-group" id="puissance-fiscale-voiture">
                <label for="mission-puissance-fiscale">Puissance fiscale :</label>
                <select id="mission-puissance-fiscale" name="mission-puissance-fiscale">
                    <option value="3 CV et moins">3 CV et moins</option>
                    <option value="4 CV">4 CV</option>
                    <option value="5 CV" selected>5 CV</option>
                    <option value="6 CV">6 CV</option>
                    <option value="7 CV et plus">7 CV et plus</option>
                </select>
                <small>Selon barème fiscal 2023</small>
            </div>
            
            <div class="form-group">
                <label for="mission-hebergement">Frais d'hébergement :</label>
                <input type="number" id="mission-hebergement" name="mission-hebergement" step="0.01" value="0">
            </div>
            
            <button type="button" class="btn" id="btn-ajouter-mission">Ajouter cette mission</button>
            
            <div id="liste-missions">
                <h4>Missions enregistrées</h4>
                <div id="missions-container"></div>
                <p id="total-missions">Total des frais de missions: 0.00 €</p>
            </div>
        `;
        
        // Créer la section des factures
        const sectionFactures = document.createElement('div');
        sectionFactures.id = 'section-factures';
        sectionFactures.innerHTML = `
            <h3>Matériel professionnel (factures)</h3>
            <div class="info-box">
                <p>Ajoutez ici vos factures de matériel professionnel. Pour les équipements amortissables, indiquez la durée d'amortissement.</p>
            </div>
            
            <div class="form-group">
                <label for="facture-date">Date d'achat :</label>
                <input type="date" id="facture-date" name="facture-date">
            </div>
            
            <div class="form-group">
                <label for="facture-description">Description :</label>
                <input type="text" id="facture-description" name="facture-description" placeholder="Ex: Ordinateur, Caméra, etc.">
            </div>
            
            <div class="form-group">
                <label for="facture-montant">Montant (€) :</label>
                <input type="number" id="facture-montant" name="facture-montant" step="0.01" value="0">
            </div>
            
            <div class="form-group">
                <label for="facture-amortissement">Durée d'amortissement (années) :</label>
                <select id="facture-amortissement" name="facture-amortissement">
                    <option value="1">Pas d'amortissement (déduction totale cette année)</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans</option>
                    <option value="4">4 ans</option>
                    <option value="5">5 ans</option>
                </select>
            </div>
            
            <button type="button" class="btn" id="btn-ajouter-facture">Ajouter cette facture</button>
            
            <div id="liste-factures">
                <h4>Factures enregistrées</h4>
                <div id="factures-container"></div>
                <p id="total-factures">Total des factures: 0.00 € (déduction pour cette année: 0.00 €)</p>
            </div>
        `;
        
        // Insérer les nouvelles sections avant les autres frais
        const autresFraisGroup = document.querySelector('label[for="autres-frais"]').parentNode;
        sectionFraisReels.insertBefore(sectionMissions, autresFraisGroup);
        sectionFraisReels.insertBefore(sectionFactures, autresFraisGroup);
    }
    
    // Fonction pour initialiser les gestionnaires d'événements des nouvelles sections
    function initialiserGestionnaires() {
        // Gestionnaire pour l'ajout de mission
        const btnAjouterMission = document.getElementById('btn-ajouter-mission');
        btnAjouterMission.addEventListener('click', ajouterMission);
        
        // Gestionnaire pour l'ajout de facture
        const btnAjouterFacture = document.getElementById('btn-ajouter-facture');
        btnAjouterFacture.addEventListener('click', ajouterFacture);
        
        // Gestionnaire pour le changement de type de véhicule
        const typeVehiculeSelect = document.getElementById('mission-type-vehicule');
        typeVehiculeSelect.addEventListener('change', mettreAJourPuissanceFiscale);
        
        // Initialiser les options de puissance fiscale
        mettreAJourPuissanceFiscale();
    }
    
    // Fonction pour mettre à jour les options de puissance fiscale en fonction du type de véhicule
    function mettreAJourPuissanceFiscale() {
        const typeVehicule = document.getElementById('mission-type-vehicule').value;
        const puissanceFiscaleSelect = document.getElementById('mission-puissance-fiscale');
        
        // Vider les options actuelles
        puissanceFiscaleSelect.innerHTML = '';
        
        // Ajouter les options en fonction du type de véhicule
        if (typeVehicule === 'voiture') {
            Baremes.kilometrique.voitures.forEach(voiture => {
                const option = document.createElement('option');
                option.value = voiture.puissance;
                option.textContent = voiture.puissance;
                if (voiture.puissance === '5 CV') {
                    option.selected = true;
                }
                puissanceFiscaleSelect.appendChild(option);
            });
        } else if (typeVehicule === 'moto') {
            Baremes.kilometrique.motos.forEach(moto => {
                const option = document.createElement('option');
                option.value = moto.puissance;
                option.textContent = moto.puissance;
                puissanceFiscaleSelect.appendChild(option);
            });
        } else if (typeVehicule === 'scooter') {
            const option = document.createElement('option');
            option.value = Baremes.kilometrique.scooters[0].puissance;
            option.textContent = Baremes.kilometrique.scooters[0].puissance;
            puissanceFiscaleSelect.appendChild(option);
        }
    }
    
    // Fonction pour ajouter une mission
    function ajouterMission() {
        const date = document.getElementById('mission-date').value;
        const description = document.getElementById('mission-description').value;
        const nbRepas = parseInt(document.getElementById('mission-repas').value) || 0;
        const km = parseInt(document.getElementById('mission-km').value) || 0;
        const hebergement = parseFloat(document.getElementById('mission-hebergement').value) || 0;
        const typeRepas = document.getElementById('mission-type-repas').value;
        const typeVehicule = document.getElementById('mission-type-vehicule').value;
        const puissanceFiscale = document.getElementById('mission-puissance-fiscale').value;
        
        // Vérifier que les champs obligatoires sont remplis
        if (!date || !description) {
            alert('Veuillez remplir la date et la description de la mission.');
            return;
        }
        
        // Calculer les frais de repas en utilisant le barème
        let fraisRepas = 0;
        if (nbRepas > 0) {
            fraisRepas = Baremes.repas.calculRepas(typeRepas, nbRepas);
        }
        
        // Calculer les frais kilométriques en utilisant le barème
        let fraisKm = 0;
        if (km > 0) {
            if (typeVehicule === 'voiture') {
                fraisKm = Baremes.kilometrique.calculVoiture(puissanceFiscale, km);
            } else if (typeVehicule === 'moto') {
                fraisKm = Baremes.kilometrique.calculMoto(puissanceFiscale, km);
            } else if (typeVehicule === 'scooter') {
                fraisKm = Baremes.kilometrique.calculScooter(km);
            }
        }
        
        const totalFrais = fraisRepas + fraisKm + hebergement;
        
        // Créer l'objet mission
        const mission = {
            id: Date.now(), // Identifiant unique basé sur le timestamp
            date,
            description,
            nbRepas,
            typeRepas,
            km,
            typeVehicule,
            puissanceFiscale,
            hebergement,
            fraisRepas,
            fraisKm,
            totalFrais
        };
        
        // Ajouter la mission au tableau
        missions.push(mission);
        
        // Réinitialiser le formulaire
        document.getElementById('mission-date').value = '';
        document.getElementById('mission-description').value = '';
        document.getElementById('mission-repas').value = '0';
        document.getElementById('mission-km').value = '0';
        document.getElementById('mission-hebergement').value = '0';
        
        // Mettre à jour l'affichage
        afficherMissions();
    }
    
    // Fonction pour afficher les missions
    function afficherMissions() {
        const container = document.getElementById('missions-container');
        container.innerHTML = '';
        
        // Trier les missions par date
        missions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculer le total des frais
        let totalFrais = 0;
        
        missions.forEach(mission => {
            totalFrais += mission.totalFrais;
            
            // Obtenir les libellés pour l'affichage
            let typeRepasLibelle = '';
            if (mission.typeRepas === 'repasAuRestaurant') {
                typeRepasLibelle = 'Repas au restaurant';
            } else if (mission.typeRepas === 'repasSurLieuDeTravail') {
                typeRepasLibelle = 'Repas sur lieu de travail';
            } else if (mission.typeRepas === 'repasDeplacement') {
                typeRepasLibelle = 'Repas en déplacement';
            }
            
            let vehiculeInfo = '';
            if (mission.typeVehicule === 'voiture') {
                vehiculeInfo = `Voiture (${mission.puissanceFiscale})`;
            } else if (mission.typeVehicule === 'moto') {
                vehiculeInfo = `Moto (${mission.puissanceFiscale})`;
            } else if (mission.typeVehicule === 'scooter') {
                vehiculeInfo = 'Scooter';
            }
            
            const missionElement = document.createElement('div');
            missionElement.className = 'mission-entry';
            missionElement.innerHTML = `
                <div class="mission-header">
                    <span class="mission-date">${formatDate(mission.date)}</span>
                    <div class="mission-actions">
                        <button class="btn btn-small btn-danger" data-id="${mission.id}">Supprimer</button>
                    </div>
                </div>
                <p><strong>${mission.description}</strong></p>
                ${mission.nbRepas > 0 ? `<p>Repas: ${mission.nbRepas} ${typeRepasLibelle} (${mission.fraisRepas.toFixed(2)} €)</p>` : ''}
                ${mission.km > 0 ? `<p>Kilomètres: ${mission.km} km avec ${vehiculeInfo} (${mission.fraisKm.toFixed(2)} €)</p>` : ''}
                ${mission.hebergement > 0 ? `<p>Hébergement: ${mission.hebergement.toFixed(2)} €</p>` : ''}
                <p><strong>Total: ${mission.totalFrais.toFixed(2)} €</strong></p>
            `;
            
            // Ajouter le gestionnaire d'événement pour supprimer la mission
            const btnSupprimer = missionElement.querySelector('.btn-danger');
            btnSupprimer.addEventListener('click', function() {
                supprimerMission(mission.id);
            });
            
            container.appendChild(missionElement);
        });
        
        // Mettre à jour le total
        document.getElementById('total-missions').textContent = `Total des frais de missions: ${totalFrais.toFixed(2)} €`;
        
        // Mettre à jour le champ de frais de transport dans le formulaire principal
        document.getElementById('frais-transport').value = totalFrais.toFixed(2);
    }
    
    // Fonction pour supprimer une mission
    function supprimerMission(id) {
        missions = missions.filter(mission => mission.id !== id);
        afficherMissions();
    }
    
    // Fonction pour ajouter une facture
    function ajouterFacture() {
        const date = document.getElementById('facture-date').value;
        const description = document.getElementById('facture-description').value;
        const montant = parseFloat(document.getElementById('facture-montant').value) || 0;
        const amortissement = parseInt(document.getElementById('facture-amortissement').value) || 1;
        
        // Vérifier que les champs obligatoires sont remplis
        if (!date || !description || montant <= 0) {
            alert('Veuillez remplir tous les champs de la facture avec des valeurs valides.');
            return;
        }
        
        // Créer l'objet facture
        const facture = {
            id: Date.now(), // Identifiant unique basé sur le timestamp
            date,
            description,
            montant,
            amortissement
        };
        
        // Ajouter la facture au tableau
        factures.push(facture);
        
        // Réinitialiser le formulaire
        document.getElementById('facture-date').value = '';
        document.getElementById('facture-description').value = '';
        document.getElementById('facture-montant').value = '0';
        document.getElementById('facture-amortissement').value = '1';
        
        // Mettre à jour l'affichage
        afficherFactures();
    }
    
    // Fonction pour afficher les factures
    function afficherFactures() {
        const container = document.getElementById('factures-container');
        container.innerHTML = '';
        
        // Trier les factures par date
        factures.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculer le total des factures et la déduction pour cette année
        let totalFactures = 0;
        let totalDeduction = 0;
        
        factures.forEach(facture => {
            totalFactures += facture.montant;
            
            // Calculer la déduction pour cette année
            const deductionAnnuelle = facture.amortissement > 1 ? 
                facture.montant / facture.amortissement : 
                facture.montant;
            
            totalDeduction += deductionAnnuelle;
            
            const factureElement = document.createElement('div');
            factureElement.className = 'facture-item';
            factureElement.innerHTML = `
                <div class="facture-details">
                    <p><strong>${formatDate(facture.date)} - ${facture.description}</strong></p>
                    <p>Montant: ${facture.montant.toFixed(2)} €</p>
                    ${facture.amortissement > 1 ? 
                        `<p>Amortissement sur ${facture.amortissement} ans (déduction annuelle: ${deductionAnnuelle.toFixed(2)} €)</p>` : 
                        '<p>Déduction totale cette année</p>'}
                </div>
                <span class="facture-montant">${facture.montant.toFixed(2)} €</span>
                <button class="btn btn-small btn-danger" data-id="${facture.id}">Supprimer</button>
            `;
            
            // Ajouter le gestionnaire d'événement pour supprimer la facture
            const btnSupprimer = factureElement.querySelector('.btn-danger');
            btnSupprimer.addEventListener('click', function() {
                supprimerFacture(facture.id);
            });
            
            container.appendChild(factureElement);
        });
        
        // Mettre à jour le total
        document.getElementById('total-factures').textContent = 
            `Total des factures: ${totalFactures.toFixed(2)} € (déduction pour cette année: ${totalDeduction.toFixed(2)} €)`;
        
        // Mettre à jour le champ de frais de matériel dans le formulaire principal
        document.getElementById('frais-materiel').value = totalDeduction.toFixed(2);
    }
    
    // Fonction pour supprimer une facture
    function supprimerFacture(id) {
        factures = factures.filter(facture => facture.id !== id);
        afficherFactures();
    }
    
    // Fonction utilitaire pour formater une date
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
});