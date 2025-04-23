#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod watch2give {

    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct Watch2Give {
        ad_token_balances: Mapping<AccountId, u32>,
        proofs: Mapping<AccountId, Hash>,
        staked_balances: Mapping<AccountId, Balance>,
        donation_counts: Mapping<(AccountId, AccountId), u32>,
    }

    #[ink(event)]
    pub struct DonationMade {
        #[ink(topic)]
        user: AccountId,
        #[ink(topic)]
        vendor: AccountId,
        amount: u32,
        timestamp: u64,
    }

    // ✅ 이벤트 2: ProofSubmitted
    #[ink(event)]
    pub struct ProofSubmitted {
        #[ink(topic)]
        user: AccountId,
        hash: Hash,
        timestamp: u64,
    }

    impl Watch2Give {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                ad_token_balances: Mapping::default(),
                proofs: Mapping::default(),
                staked_balances: Mapping::default(),
                donation_counts: Mapping::default(),
            }
        }

        /// --- AdToken logic ---
        #[ink(message, selector = 0xA1A1A1A1)]
        pub fn mint_ad_token(&mut self, to: AccountId, amount: u32) {
            let prev = self.ad_token_balances.get(&to).unwrap_or(0);
            self.ad_token_balances.insert(to, &(prev.saturating_add(amount)));
        }

        #[ink(message, selector = 0xA1A1A1A2)]
        pub fn burn_ad_token(&mut self, from: AccountId, amount: u32) {
            let prev = self.ad_token_balances.get(&from).unwrap_or(0);
            assert!(prev >= amount, "Insufficient tokens to burn");
            self.ad_token_balances.insert(from, &prev.saturating_sub(amount));

        }

        #[ink(message, selector = 0xA1A1A1A3)]
        pub fn get_ad_token_balance(&self, user: AccountId) -> u32 {
            self.ad_token_balances.get(&user).unwrap_or(0)
        }
        #[ink(message, selector = 0xA1A1A1A4)]
        pub fn donate_tokens(&mut self, vendor: AccountId, amount: u32) {
            let user = self.env().caller();
            let user_balance = self.ad_token_balances.get(&user).unwrap_or(0);

            assert!(user_balance >= amount, "Not enough tokens");

    
            self.ad_token_balances.insert(user, &(user_balance.saturating_sub(amount)));
            let vendor_balance = self.ad_token_balances.get(&vendor).unwrap_or(0);
            self.ad_token_balances.insert(vendor, &(vendor_balance.saturating_add(amount)));

            let key = (user, vendor);
            let prev = self.donation_counts.get(&key).unwrap_or(0);
            self.donation_counts.insert(key, &(prev.saturating_add(1)));

            self.env().emit_event(DonationMade {
                user,
                vendor,
                amount,
                timestamp: self.env().block_timestamp(),
            });
        }

        /// --- ProofRegistry logic ---
        #[ink(message, selector = 0xB2B2B2B1)]
        pub fn submit_proof(&mut self, user: AccountId, proof_hash: Hash) {
            self.proofs.insert(user, &proof_hash);

            self.env().emit_event(ProofSubmitted {
                user,
                hash: proof_hash,
                timestamp: self.env().block_timestamp(),
            });
        }

        #[ink(message, selector = 0xB2B2B2B2)]
        pub fn get_proof(&self, user: AccountId) -> Option<Hash> {
            self.proofs.get(&user)
        }

        /// --- VaultStaker logic ---
        #[ink(message, payable, selector = 0xC3C3C3C1)]
        pub fn stake(&mut self) {
            let caller = self.env().caller();
            let amount = self.env().transferred_value();
            let prev = self.staked_balances.get(&caller).unwrap_or(0);
            self.staked_balances.insert(caller, &prev.saturating_add(amount));
        }

        #[ink(message, selector = 0xC3C3C3C2)]
        pub fn get_stake(&self, user: AccountId) -> Balance {
            self.staked_balances.get(&user).unwrap_or(0)
        }

    }}

    