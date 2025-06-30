import rawData from './complete.json' assert { type: 'json' };

function countSubdistricts(data) {
    let total = 0;
    
    console.log('Number of divisions:', data.length);
    
    for (const division of data) {
        console.log(`\nDivision: ${division.name}`);
        for (const district of division.districts) {
            const count = district.subdistricts?.length || 0;
            console.log(`District ${district.name}: ${count} subdistricts`);
            total += count;
        }
    }
    
    return total;
}

const data = rawData.default || rawData;
console.log('\nTotal number of subdistricts:', countSubdistricts(data));