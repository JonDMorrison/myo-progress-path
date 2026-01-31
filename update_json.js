import fs from 'fs';
const path = 'public/24-week-program.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.forEach(w => {
    w.requires_video_first = true;
    w.requires_video_last = true;

    if ([1, 2, 11, 12, 23, 24].includes(w.week)) {
        if (!w.tracking) w.tracking = {};
        w.tracking.BOLT_score = true;
    } else {
        if (w.tracking) w.tracking.BOLT_score = false;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('JSON updated successfully');
