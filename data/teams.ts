

export interface TeamData {
    name: string;
    colors: { primary: string; secondary: string; text?: string };
    nickname: string;
    stadium: string;
    rivals: string[];
    location?: string;
  }
  
  // A helper to ensure text contrast on team backgrounds
  const C = {
    crimson: "#9e1b32",
    white: "#ffffff",
    orange: "#f76900",
    blue: "#0021A5",
    gatorBlue: "#0021A5",
    gatorOrange: "#FA4616",
    michBlue: "#00274c",
    michMaize: "#ffcb05",
    osuScarlet: "#bb0000",
    osuGrey: "#666666",
    lsuPurple: "#461d7c",
    lsuGold: "#fdd023",
    uscCardinal: "#990000",
    uscGold: "#FFC72C",
    texasBurntOrange: "#bf5700",
    clemsonOrange: "#F56600",
    clemsonPurple: "#522D80",
    fsuGarnet: "#782F40",
    fsuGold: "#CEB888",
    notreDameGold: "#c99700",
    notreDameBlue: "#0c2340",
    bamaCrimson: "#9E1B32",
    ugaRed: "#BA0C2F",
    tennOrange: "#FF8200",
    oregonGreen: "#154733",
    oregonYellow: "#FEE123",
    miamiGreen: "#005030",
    miamiOrange: "#F47321",
    pennStateBlue: "#041E42",
    ouCrimson: "#841617",
    ouCream: "#fdf9d8",
    auburnBlue: "#0C2340",
    auburnOrange: "#E87722",
    nebRed: "#E41C38",
    nebCream: "#FDF2D9",
    wiscRed: "#c5050c",
    tamuMaroon: "#500000",
  };
  
  export const TEAM_DATABASE: Record<string, Omit<TeamData, 'name'>> = {
    // SEC
    "Alabama": { colors: { primary: C.bamaCrimson, secondary: C.white }, nickname: "Crimson Tide", stadium: "Bryant-Denny Stadium", rivals: ["Auburn", "Tennessee", "LSU"], location: "Tuscaloosa, AL" },
    "Auburn": { colors: { primary: C.auburnBlue, secondary: C.auburnOrange }, nickname: "Tigers", stadium: "Jordan-Hare Stadium", rivals: ["Alabama", "Georgia"], location: "Auburn, AL" },
    "Florida": { colors: { primary: C.gatorBlue, secondary: C.gatorOrange }, nickname: "Gators", stadium: "The Swamp", rivals: ["Florida State", "Georgia", "Tennessee"], location: "Gainesville, FL" },
    "Georgia": { colors: { primary: C.ugaRed, secondary: "#000000" }, nickname: "Bulldogs", stadium: "Sanford Stadium", rivals: ["Florida", "Auburn", "Georgia Tech"], location: "Athens, GA" },
    "LSU": { colors: { primary: C.lsuPurple, secondary: C.lsuGold }, nickname: "Tigers", stadium: "Death Valley", rivals: ["Alabama", "Arkansas", "Ole Miss"], location: "Baton Rouge, LA" },
    "Tennessee": { colors: { primary: C.tennOrange, secondary: C.white }, nickname: "Volunteers", stadium: "Neyland Stadium", rivals: ["Alabama", "Florida", "Vanderbilt"], location: "Knoxville, TN" },
    "Texas A&M": { colors: { primary: C.tamuMaroon, secondary: C.white }, nickname: "Aggies", stadium: "Kyle Field", rivals: ["Texas", "LSU"], location: "College Station, TX" },
    "Ole Miss": { colors: { primary: "#CE1126", secondary: "#14213D" }, nickname: "Rebels", stadium: "Vaught-Hemingway", rivals: ["Mississippi State", "LSU"], location: "Oxford, MS" },
    
    // Big Ten
    "Ohio State": { colors: { primary: C.osuScarlet, secondary: "#bbbbbb" }, nickname: "Buckeyes", stadium: "The Horseshoe", rivals: ["Michigan", "Penn State"], location: "Columbus, OH" },
    "Michigan": { colors: { primary: C.michBlue, secondary: C.michMaize }, nickname: "Wolverines", stadium: "The Big House", rivals: ["Ohio State", "Michigan State"], location: "Ann Arbor, MI" },
    "Penn State": { colors: { primary: C.pennStateBlue, secondary: C.white }, nickname: "Nittany Lions", stadium: "Beaver Stadium", rivals: ["Ohio State", "Pitt"], location: "State College, PA" },
    "Wisconsin": { colors: { primary: C.wiscRed, secondary: C.white }, nickname: "Badgers", stadium: "Camp Randall", rivals: ["Minnesota", "Iowa"], location: "Madison, WI" },
    "Nebraska": { colors: { primary: C.nebRed, secondary: C.nebCream }, nickname: "Cornhuskers", stadium: "Memorial Stadium", rivals: ["Oklahoma", "Iowa", "Colorado"], location: "Lincoln, NE" },
    "Iowa": { colors: { primary: "#000000", secondary: "#FFCD00" }, nickname: "Hawkeyes", stadium: "Kinnick Stadium", rivals: ["Iowa State", "Wisconsin"], location: "Iowa City, IA" },
    "USC": { colors: { primary: C.uscCardinal, secondary: C.uscGold }, nickname: "Trojans", stadium: "The Coliseum", rivals: ["UCLA", "Notre Dame"], location: "Los Angeles, CA" },
    "Oregon": { colors: { primary: C.oregonGreen, secondary: C.oregonYellow }, nickname: "Ducks", stadium: "Autzen Stadium", rivals: ["Washington", "Oregon State"], location: "Eugene, OR" },
    "Washington": { colors: { primary: "#4B2E83", secondary: "#B7A57A" }, nickname: "Huskies", stadium: "Husky Stadium", rivals: ["Oregon", "Washington State"], location: "Seattle, WA" },
  
    // Big 12
    "Texas": { colors: { primary: C.texasBurntOrange, secondary: C.white }, nickname: "Longhorns", stadium: "DKR Memorial", rivals: ["Oklahoma", "Texas A&M"], location: "Austin, TX" },
    "Oklahoma": { colors: { primary: C.ouCrimson, secondary: C.ouCream }, nickname: "Sooners", stadium: "Gaylord Memorial", rivals: ["Texas", "Oklahoma State"], location: "Norman, OK" },
    "Oklahoma State": { colors: { primary: "#FF7300", secondary: "#000000" }, nickname: "Cowboys", stadium: "Boone Pickens", rivals: ["Oklahoma"], location: "Stillwater, OK" },
    
    // ACC
    "Florida State": { colors: { primary: C.fsuGarnet, secondary: C.fsuGold }, nickname: "Seminoles", stadium: "Doak Campbell", rivals: ["Florida", "Miami", "Clemson"], location: "Tallahassee, FL" },
    "Clemson": { colors: { primary: C.clemsonOrange, secondary: C.clemsonPurple }, nickname: "Tigers", stadium: "Death Valley", rivals: ["South Carolina", "Florida State"], location: "Clemson, SC" },
    "Miami": { colors: { primary: C.miamiGreen, secondary: C.miamiOrange }, nickname: "Hurricanes", stadium: "Hard Rock Stadium", rivals: ["Florida State", "Florida"], location: "Coral Gables, FL" },
    "North Carolina": { colors: { primary: "#7BAFD4", secondary: "#FFFFFF" }, nickname: "Tar Heels", stadium: "Kenan Memorial", rivals: ["Duke", "NC State"], location: "Chapel Hill, NC" },
    "Virginia Tech": { colors: { primary: "#630031", secondary: "#CF4420" }, nickname: "Hokies", stadium: "Lane Stadium", rivals: ["Virginia", "West Virginia"], location: "Blacksburg, VA" },
  
    // Independents / Others
    "Notre Dame": { colors: { primary: C.notreDameBlue, secondary: C.notreDameGold }, nickname: "Fighting Irish", stadium: "Notre Dame Stadium", rivals: ["USC", "Navy", "Michigan"], location: "South Bend, IN" },
  };
  
  // Procedural Generator for ANY team
  const generateUnknownTeamData = (teamName: string): TeamData => {
    // Simple hash function to get a consistent number from the string
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const colors = [
      { p: "#c1272d", s: "#ffffff" }, // Red/White
      { p: "#00274c", s: "#ffcb05" }, // Blue/Yellow
      { p: "#005a9c", s: "#ffffff" }, // Blue/White
      { p: "#4f2d7f", s: "#ffffff" }, // Purple/White
      { p: "#006747", s: "#cfb87c" }, // Green/Gold
      { p: "#000000", s: "#cfb87c" }, // Black/Gold
      { p: "#800000", s: "#ffffff" }, // Maroon/White
      { p: "#ff7300", s: "#000000" }, // Orange/Black
    ];
  
    const colorIndex = Math.abs(hash) % colors.length;
    const selectedColor = colors[colorIndex];
  
    // Heuristic Color Overrides based on name
    const n = teamName.toLowerCase();
    if (n.includes('red') || n.includes('state')) selectedColor.p = "#9e1b32";
    if (n.includes('blue') || n.includes('kentucky')) selectedColor.p = "#005a9c";
    if (n.includes('green') || n.includes('north')) selectedColor.p = "#006747";
    if (n.includes('gold') || n.includes('tech')) selectedColor.s = "#cfb87c";
    if (n.includes('purple')) selectedColor.p = "#4f2d7f";
    if (n.includes('orange')) selectedColor.p = "#ff7300";
  
    return {
      name: teamName,
      colors: { primary: selectedColor.p, secondary: selectedColor.s },
      nickname: "Athletes", // Generic fallback
      stadium: `${teamName} Stadium`,
      rivals: ["Conference Rival"],
      location: "Campus",
    };
  };
  
  export const getTeamDetails = (teamName: string): TeamData => {
    // 1. Direct Match
    if (TEAM_DATABASE[teamName]) {
      return { ...TEAM_DATABASE[teamName], name: teamName };
    }
  
    // 2. Fuzzy Match (e.g., "Florida Gators" -> "Florida")
    const keys = Object.keys(TEAM_DATABASE);
    for (const key of keys) {
      if (teamName.includes(key) || (TEAM_DATABASE[key].nickname && teamName.includes(TEAM_DATABASE[key].nickname))) {
        return { ...TEAM_DATABASE[key], name: teamName };
      }
    }
  
    // 3. Fallback Generator
    return generateUnknownTeamData(teamName);
  };
