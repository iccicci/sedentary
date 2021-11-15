/* eslint-disable no-console */

// The account we use to store followings
//const followingsUID = 3186068;
const followingsUID = 95946583;
// Gather the loggedUID from window.localStorage
const { loggedUID } = window.localStorage;
// Gather the CSRF-Token from the cookies
const csrf = document.cookie.split("; ").reduce((ret, _) => (_.startsWith("session_key=") ? _.substr(12) : ret), null);

// APIs could have errors, let's do some retries
async function myFetch(url, options, attempt = 0) {
  try {
    const res = await fetch("https://booyah.live/api/v3/" + url, options);
    const ret = await res.json();

    return ret;
  } catch(e) {
    // After too many consecutive errors, let's abort: we need to retry later
    if(attempt === 3) throw e;

    return myFetch(url, option, attempt + 1);
  }
}

function expire(uid, add = true) {
  const { followingsExpire } = window.localStorage;
  let expires = {};

  try {
    // Get and parse followingsExpire from localStorage
    expires = JSON.parse(followingsExpire);
  } catch(e) {
    // In case of error (ex. new browsers) simply init to empty
    window.localStorage.followingsExpire = "{}";
  }

  if(! uid) return expires;

  // Set expire after 1 day
  if(add) expires[uid] = new Date().getTime() + 3600 * 24 * 1000;
  else delete expires[uid];

  window.localStorage.followingsExpire = JSON.stringify(expires);
}

async function clean() {
  try {
    const expires = expire();
    const now = new Date().getTime();

    for(const uid in expires) {
      if(expires[uid] < now) {
        await followUser(parseInt(uid), false);
        expire(uid, false);
      }
    }
  } catch(e) {}

  // Repeat clean in an hour
  window.setTimeout(clean, 3600 * 1000);
}

async function fetchFollow(uid, type = "followers", from = 0) {
  const { cursor, follower_list, following_list } = await myFetch(`users/${uid}/${type}?cursor=${from}&count=50`);
  const got = (type === "followers" ? follower_list : following_list).map(_ => _.uid);
  const others = cursor ? await fetchFollow(uid, type, cursor) : [];

  return [...got, ...others];
}

async function followUser(uid, follow = true) {
  console.log(`${follow ? "F" : "Unf"}ollowing ${uid}...`);
  return myFetch(`users/${loggedUID}/followings`, {
    method:  follow ? "POST" : "DELETE",
    headers: { "X-CSRF-Token": csrf },
    body:    JSON.stringify({ followee_uid: uid, source: 43 })
  });
}

async function doAll() {
  if(! loggedUID) throw new Error("Can't get 'loggedUID' from localStorage: try to login again");
  if(! csrf) throw new Error("Can't get session token from cookies: try to login again");

  console.log("Fetching current followings...");
  const currentFollowings = await fetchFollow(loggedUID, "followings");

  console.log("Fetching permanent followings...");
  const permanentFollowings = await fetchFollow(followingsUID, "followings");

  console.log("Syncing permanent followings...");
  for(const uid of permanentFollowings) {
    expire(uid, false);

    if(currentFollowings.indexOf(uid) === -1) {
      await followUser(uid);
      currentFollowings.push(uid);
    }
  }

  // Sync followingsExpire in localStorage
  for(const uid of currentFollowings) if(permanentFollowings.indexOf(uid) === -1) expire(uid);
  // Call first clean task in 5 minutes
  window.setTimeout(clean, 300 * 1000);

  // Gather uid from window.location
  const match = /\/studio\/(\d+)/.exec(window.location.pathname);

  if(match) {
    console.log("Fetching this user followers...");
    const followings = await fetchFollow(parseInt(match[1]));

    for(const uid of followings) {
      if(currentFollowings.indexOf(uid) === -1) {
        await followUser(uid);
        expire(uid);
      }
    }
  }

  return "Done";
}

// https://booyah.live/studio/3999290?source=31

await doAll();
