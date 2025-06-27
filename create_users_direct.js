const fs = require('fs');
const path = require('path');

// Konfiguracja
const DATA_PROVIDER_API_URL = 'http://localhost:8110';
const TENANT_ID = 'tenant_duza_firma';
const COMPANY_ID = 'company_tenant_duza_firma';

// Struktura zespołów zgodnie z PRD
const TEAMS = [
  { name: 'Księgowość', userCount: 12, startUser: 1 },
  { name: 'Kadry', userCount: 8, startUser: 13 },
  { name: 'Sales & Marketing', userCount: 15, startUser: 21 },
  { name: 'IT', userCount: 10, startUser: 36 },
  { name: 'Zarząd', userCount: 5, startUser: 46 }
];

// Profile na zespół
const TEAM_PROFILES = {
  'Księgowość': [
    {app_id: 'ksef', profile_name: 'Księgowa'},
    {app_id: 'edeklaracje', profile_name: 'Edytor'},
    {app_id: 'fk', profile_name: 'Księgowy'}
  ],
  'Kadry': [
    {app_id: 'hr', profile_name: 'HR Manager'},
    {app_id: 'edokumenty', profile_name: 'Księgowa'}
  ],
  'Sales & Marketing': [
    {app_id: 'crm', profile_name: 'Sales Manager'},
    {app_id: 'edokumenty', profile_name: 'Użytkownik'}
  ],
  'IT': [
    {app_id: 'ebiuro', profile_name: 'Administrator'},
    {app_id: 'edokumenty', profile_name: 'Administrator'}
  ],
  'Zarząd': [
    {app_id: 'ksef', profile_name: 'Administrator'},
    {app_id: 'edeklaracje', profile_name: 'Administrator'},
    {app_id: 'fk', profile_name: 'Administrator'},
    {app_id: 'edokumenty', profile_name: 'Administrator'},
    {app_id: 'hr', profile_name: 'Administrator'},
    {app_id: 'crm', profile_name: 'Administrator'}
  ]
};

// Funkcja do ładowania imion i nazwisk
function loadNames() {
  try {
    const filePath = path.join(__dirname, 'polskie_imiona_nazwiska.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^\d+\.\s*(.+)$/);
        return match ? match[1].trim() : line.trim();
      });
  } catch (error) {
    console.error('Błąd wczytywania imion:', error);
    return [];
  }
}

// Funkcja API call z retry
async function makeApiCall(url, method, data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}: ${errorText}`);
        
        if (response.status === 409 && errorText.includes('already exists')) {
          console.log(`⚠️  Zasób już istnieje, kontynuujemy...`);
          return { message: 'Already exists', status: 409 };
        }
        
        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        continue;
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries} po błędzie:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function createUser(userData) {
  const url = `${DATA_PROVIDER_API_URL}/api/users`;
  console.log(`📝 Tworzenie użytkownika: ${userData.full_name} (${userData.username})`);
  
  const result = await makeApiCall(url, 'POST', userData);
  if (result && result.status !== 409) {
    console.log(`✅ Utworzono: ${userData.full_name}`);
  }
  return result;
}

async function assignUserToCompany(userId, companyId) {
  const url = `${DATA_PROVIDER_API_URL}/api/users/${userId}/companies`;
  console.log(`🏢 Przypisanie ${userId} do firmy ${companyId}`);
  
  const result = await makeApiCall(url, 'POST', {
    user_id: userId,
    company_id: companyId
  });
  return result;
}

async function assignUserProfile(userId, profile) {
  const url = `${DATA_PROVIDER_API_URL}/api/users/${userId}/profiles`;
  console.log(`👤 Przypisanie profilu ${profile.app_id}:${profile.profile_name} dla ${userId}`);
  
  const result = await makeApiCall(url, 'POST', {
    user_id: userId,
    app_id: profile.app_id,
    profile_name: profile.profile_name
  });
  return result;
}

async function syncUserProfiles(userId) {
  const url = `${DATA_PROVIDER_API_URL}/api/users/${userId}/sync-profiles`;
  console.log(`🔄 Synchronizacja profili dla ${userId}`);
  
  const result = await makeApiCall(url, 'POST');
  return result;
}

async function main() {
  console.log('🚀 Rozpoczynanie tworzenia użytkowników dla tenant_duza_firma...\n');
  
  // Wczytaj imiona i nazwiska
  const names = loadNames();
  if (names.length === 0) {
    console.error('❌ Nie udało się wczytać imion i nazwisk!');
    process.exit(1);
  }
  
  console.log(`📋 Wczytano ${names.length} imion i nazwisk\n`);
  
  let totalUsersCreated = 0;
  let currentNameIndex = 0;
  
  // Sprawdź aktualny stan użytkowników
  console.log('🔍 Sprawdzanie aktualnego stanu...');
  try {
    const currentUsersResponse = await fetch(`${DATA_PROVIDER_API_URL}/api/users?tenant_id=${TENANT_ID}`);
    const currentUsers = await currentUsersResponse.json();
    console.log(`📊 Aktualnie w systemie: ${currentUsers.users?.length || 0} użytkowników\n`);
  } catch (error) {
    console.error('⚠️  Nie udało się sprawdzić aktualnego stanu:', error.message);
  }
  
  // Iteruj przez zespoły
  for (const team of TEAMS) {
    console.log(`\n🏢 === ZESPÓŁ: ${team.name.toUpperCase()} ===`);
    console.log(`👥 Tworzenie ${team.userCount} użytkowników (user_${team.startUser} - user_${team.startUser + team.userCount - 1})`);
    
    // Twórz użytkowników w zespole
    for (let i = 0; i < team.userCount; i++) {
      const userNumber = team.startUser + i;
      const username = `user_${userNumber}`;
      
      // Pobierz imię i nazwisko
      const fullName = names[currentNameIndex % names.length];
      currentNameIndex++;
      
      const [firstName, lastName] = fullName.split(' ');
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@innovatetech.pl`
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
      
      const userData = {
        tenant_id: TENANT_ID,
        username: username,
        email: email,
        full_name: fullName,
        metadata: {
          department: team.name,
          role: getGenericRoleByTeam(team.name),
          user_number: userNumber,
          team_start: team.startUser,
          created_by: 'direct_script'
        }
      };
      
      try {
        // 1. Utwórz użytkownika
        const userResult = await createUser(userData);
        
        if (userResult && userResult.status !== 409) {
          totalUsersCreated++;
          
          // 2. Przypisz do firmy
          await assignUserToCompany(username, COMPANY_ID);
          
          // 3. Przypisz profile zespołu
          const profiles = TEAM_PROFILES[team.name] || [];
          for (const profile of profiles) {
            await assignUserProfile(username, profile);
          }
          
          // 4. Synchronizuj profile
          await syncUserProfiles(username);
          
          console.log(`✅ Ukończono: ${fullName} (${username}) - ${team.name}`);
        }
        
        // Małe opóźnienie między użytkownikami
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Błąd podczas tworzenia ${username}:`, error.message);
      }
    }
    
    console.log(`📊 Zespół ${team.name}: zakończony`);
  }
  
  console.log(`\n🎉 === PODSUMOWANIE ===`);
  console.log(`✅ Utworzono ${totalUsersCreated} nowych użytkowników`);
  console.log(`📋 Łącznie powinno być teraz: ${totalUsersCreated + 2} użytkowników (2 istniejących + ${totalUsersCreated} nowych)`);
  
  // Sprawdź finalny stan
  try {
    const finalUsersResponse = await fetch(`${DATA_PROVIDER_API_URL}/api/users?tenant_id=${TENANT_ID}`);
    const finalUsers = await finalUsersResponse.json();
    console.log(`🔍 Rzeczywisty stan: ${finalUsers.users?.length || 0} użytkowników w systemie`);
  } catch (error) {
    console.error('⚠️  Nie udało się sprawdzić finalnego stanu:', error.message);
  }
}

function getGenericRoleByTeam(teamName) {
  switch(teamName) {
    case 'Księgowość':
      return 'Księgowy';
    case 'Kadry':
      return 'Specjalista HR';
    case 'Sales & Marketing':
      return 'Specjalista Sprzedaży';
    case 'IT':
      return 'Specjalista IT';
    case 'Zarząd':
      return 'Manager';
    default:
      return 'Specjalista';
  }
}

// Uruchom skrypt
main().catch(error => {
  console.error('❌ Krytyczny błąd:', error);
  process.exit(1);
}); 