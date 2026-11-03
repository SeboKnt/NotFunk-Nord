// Sprachspezifische Protokolle und Phrasen für NotFunk-Nord
// Internationale Kommunikationsstandards für Notfallfunk

// Typdefinitionen
export interface LanguageProtocol {
  language: string; // ISO 639-1 Code (z.B. 'de', 'en', 'fr')
  name: string; // Vollständiger Sprachname
  phoneticAlphabet: PhoneticAlphabet;
  numberPronunciation: NumberPronunciation;
  commonPhrases: CommonPhrase[];
  emergencyTerms: EmergencyTerm[];
  proceduralSignals: ProceduralSignal[];
  qCodes: QCode[];
  abbreviationStandards: AbbreviationStandard[];
}

export interface PhoneticAlphabet {
  name: string;
  letters: Array<{
    letter: string;
    pronunciation: string;
  }>;
}

export interface NumberPronunciation {
  languageSpecific: boolean;
  examples: Array<{
    number: string;
    pronunciation: string;
  }>;
}

export interface CommonPhrase {
  category: 'greeting' | 'identification' | 'request' | 'confirmation' | 'closing' | 'emergency';
  phrase: string;
  translation: string;
  usageNotes?: string[];
}

export interface EmergencyTerm {
  term: string;
  meaning: string;
  internationalUsage: boolean;
  usageContext: string[];
}

export interface ProceduralSignal {
  signal: string;
  meaning: string;
  usage: string;
  examples: string[];
}

export interface QCode {
  code: string;
  meaning: string;
  usage: string;
  examples: string[];
}

export interface AbbreviationStandard {
  abbreviation: string;
  meaning: string;
  usage: string;
}

// Sprachprotokoll Manager
export class LanguageProtocolsManager {
  private storageKey = 'language_protocols';
  
  // Standard Sprachprotokolle
  getDefaultProtocols(): LanguageProtocol[] {
    return [
      this.getGermanProtocol(),
      this.getEnglishProtocol(),
      this.getInternationalProtocol()
    ];
  }
  
  // Deutschsprachiges Protokoll
  getGermanProtocol(): LanguageProtocol {
    return {
      language: 'de',
      name: 'Deutsch',
      phoneticAlphabet: {
        name: 'Deutsches Buchstabieralphabet',
        letters: [
          { letter: 'A', pronunciation: 'Anton' },
          { letter: 'B', pronunciation: 'Berta' },
          { letter: 'C', pronunciation: 'Caesar' },
          { letter: 'D', pronunciation: 'Dora' },
          { letter: 'E', pronunciation: 'Emil' },
          { letter: 'F', pronunciation: 'Friedrich' },
          { letter: 'G', pronunciation: 'Gustav' },
          { letter: 'H', pronunciation: 'Heinrich' },
          { letter: 'I', pronunciation: 'Ida' },
          { letter: 'J', pronunciation: 'Julius' },
          { letter: 'K', pronunciation: 'Kaufmann' },
          { letter: 'L', pronunciation: 'Ludwig' },
          { letter: 'M', pronunciation: 'Martha' },
          { letter: 'N', pronunciation: 'Nordpol' },
          { letter: 'O', pronunciation: 'Otto' },
          { letter: 'P', pronunciation: 'Paula' },
          { letter: 'Q', pronunciation: 'Quelle' },
          { letter: 'R', pronunciation: 'Richard' },
          { letter: 'S', pronunciation: 'Samuel' },
          { letter: 'T', pronunciation: 'Theodor' },
          { letter: 'U', pronunciation: 'Ulrich' },
          { letter: 'V', pronunciation: 'Viktor' },
          { letter: 'W', pronunciation: 'Wilhelm' },
          { letter: 'X', pronunciation: 'Xanthippe' },
          { letter: 'Y', pronunciation: 'Ypsilon' },
          { letter: 'Z', pronunciation: 'Zacharias' },
          { letter: 'Ä', pronunciation: 'Ärger' },
          { letter: 'Ö', pronunciation: 'Ökonom' },
          { letter: 'Ü', pronunciation: 'Übermut' },
          { letter: 'ß', pronunciation: 'Eszett' }
        ]
      },
      numberPronunciation: {
        languageSpecific: true,
        examples: [
          { number: '0', pronunciation: 'Null' },
          { number: '1', pronunciation: 'Eins' },
          { number: '2', pronunciation: 'Zwo' }, // Im Funkverkehr häufig "Zwo" statt "Zwei"
          { number: '3', pronunciation: 'Drei' },
          { number: '4', pronunciation: 'Vier' },
          { number: '5', pronunciation: 'Fünf' },
          { number: '6', pronunciation: 'Sechs' },
          { number: '7', pronunciation: 'Sieben' },
          { number: '8', pronunciation: 'Acht' },
          { number: '9', pronunciation: 'Neun' }
        ]
      },
      commonPhrases: [
        {
          category: 'greeting',
          phrase: 'Guten Tag, hier ist [RUFZEICHEN]',
          translation: 'Good day, this is [CALLSIGN]',
          usageNotes: ['Standard-Begrüßung im deutschsprachigen Funkverkehr']
        },
        {
          category: 'identification',
          phrase: 'Dies ist Funkstation [RUFZEICHEN]',
          translation: 'This is station [CALLSIGN]',
          usageNotes: ['Formelle Identifikation']
        },
        {
          category: 'request',
          phrase: 'Bitte kommen',
          translation: 'Please respond/come back',
          usageNotes: ['Aufforderung zur Antwort']
        },
        {
          category: 'confirmation',
          phrase: 'Verstanden',
          translation: 'Understood/Roger',
          usageNotes: ['Bestätigung des Verständnisses']
        },
        {
          category: 'closing',
          phrase: 'Vielen Dank und 73',
          translation: 'Thank you and 73',
          usageNotes: ['Höflicher Abschluss mit Gruß']
        },
        {
          category: 'emergency',
          phrase: 'MAYDAY MAYDAY MAYDAY',
          translation: 'MAYDAY MAYDAY MAYDAY',
          usageNotes: ['Internationaler Notalarm']
        }
      ],
      emergencyTerms: [
        {
          term: 'MAYDAY',
          meaning: 'Internationaler Notalarm',
          internationalUsage: true,
          usageContext: ['Lebensgefahr', 'Schwerer Unfall', 'Sinkflug']
        },
        {
          term: 'PAN PAN',
          meaning: 'Dringlichkeitsmeldung',
          internationalUsage: true,
          usageContext: ['Verletzungen', 'Mechanische Probleme', 'Wichtige Nachricht']
        },
        {
          term: 'SICHERHEIT',
          meaning: 'Sicherheitsmeldung',
          internationalUsage: true,
          usageContext: ['Navigationswarnungen', 'Wetterwarnungen', 'Verkehrshindernisse']
        }
      ],
      proceduralSignals: [
        {
          signal: 'ROGER',
          meaning: 'Nachricht verstanden',
          usage: 'Bestätigung des Empfangs',
          examples: ['ROGER', 'ROGER WILCO']
        },
        {
          signal: 'WILCO',
          meaning: 'Werde Folgen/Will comply',
          usage: 'Bestätigung und Zustimmung zur Durchführung',
          examples: ['WILCO', 'ROGER WILCO']
        },
        {
          signal: 'BREAK',
          meaning: 'Unterbrechung',
          usage: 'Kennzeichnet eine Pause oder Unterbrechung',
          examples: ['BREAK BREAK']
        },
        {
          signal: 'OVER',
          meaning: 'Ende der Sendung, Antwort erbeten',
          usage: 'Sendungsende mit Rückmeldung erwartet',
          examples: ['OVER']
        },
        {
          signal: 'OUT',
          meaning: 'Ende der Sendung, keine Antwort erbeten',
          usage: 'Abschließende Sendung ohne Antworterwartung',
          examples: ['OUT']
        }
      ],
      qCodes: [
        {
          code: 'QRA',
          meaning: 'Wie ist Ihr Rufzeichen?',
          usage: 'Identifikation',
          examples: ['QRA? = Wie ist Ihr Rufzeichen?', 'QRA DL1ABC = Mein Rufzeichen ist DL1ABC']
        },
        {
          code: 'QRG',
          meaning: 'Wird meine genaue Frequenz ... Hz?',
          usage: 'Frequenzbestimmung',
          examples: ['QRG 145500 = Ihre genaue Frequenz ist 145,500 MHz']
        },
        {
          code: 'QRL',
          meaning: 'Sind Sie beschäftigt?',
          usage: 'Beschäftigt?',
          examples: ['QRL? = Sind Sie beschäftigt?']
        },
        {
          code: 'QRM',
          meaning: 'Bin ich durch Störungen behindert?',
          usage: 'Störungen',
          examples: ['QRM? = Bin ich durch Störungen behindert?']
        },
        {
          code: 'QRN',
          meaning: 'Bin ich durch Atmosphärische Störungen behindert?',
          usage: 'Atmosphärische Störungen',
          examples: ['QRN? = Bin ich durch atmosphärische Störungen behindert?']
        },
        {
          code: 'QRP',
          meaning: 'Soll ich mit geringerer Leistung senden?',
          usage: 'Leistungsreduktion',
          examples: ['QRP? = Soll ich mit geringerer Leistung senden?']
        },
        {
          code: 'QRS',
          meaning: 'Soll ich langsamer senden?',
          usage: 'Langsame Sendegeschwindigkeit',
          examples: ['QRS? = Soll ich langsamer senden?']
        },
        {
          code: 'QRV',
          meaning: 'Sind Sie bereit?',
          usage: 'Bereitschaft',
          examples: ['QRV = Ich bin bereit']
        },
        {
          code: 'QRZ',
          meaning: 'Wer ruft mich?',
          usage: 'Anruferidentifikation',
          examples: ['QRZ DL1ABC = DL1ABC ruft Sie']
        }
      ],
      abbreviationStandards: [
        {
          abbreviation: '73',
          meaning: 'Grüße/Beste Grüße',
          usage: 'Höfliche Verabschiedung im Amateurfunk'
        },
        {
          abbreviation: '88',
          meaning: 'Liebe und Küsse',
          usage: 'Persönliche Verabschiedung'
        },
        {
          abbreviation: 'BK',
          meaning: 'Break',
          usage: 'Unterbrechung in der Sendung'
        },
        {
          abbreviation: 'CL',
          meaning: 'Closed/Closing',
          usage: 'Ende einer Runde'
        },
        {
          abbreviation: 'FB',
          meaning: 'Fine Business/Fantastic',
          usage: 'Ausgezeichnete Leistung'
        },
        {
          abbreviation: 'GA',
          meaning: 'Go Ahead',
          usage: 'Senden Sie bitte'
        },
        {
          abbreviation: 'K',
          meaning: 'Over',
          usage: 'Ende der Sendung, Antwort erbeten'
        },
        {
          abbreviation: 'KN',
          meaning: 'Over to Named Station',
          usage: 'Ende, nur an bestimmte Station antworten'
        },
        {
          abbreviation: 'R',
          meaning: 'Roger/Received',
          usage: 'Nachricht empfangen und verstanden'
        },
        {
          abbreviation: 'SK',
          meaning: 'Silent Key/Ende',
          usage: 'Ende einer QSO-Runde oder zum Gedenken verstorbener OM'
        }
      ]
    };
  }
  
  // Englischsprachiges Protokoll
  getEnglishProtocol(): LanguageProtocol {
    return {
      language: 'en',
      name: 'English',
      phoneticAlphabet: {
        name: 'NATO Phonetic Alphabet',
        letters: [
          { letter: 'A', pronunciation: 'Alpha' },
          { letter: 'B', pronunciation: 'Bravo' },
          { letter: 'C', pronunciation: 'Charlie' },
          { letter: 'D', pronunciation: 'Delta' },
          { letter: 'E', pronunciation: 'Echo' },
          { letter: 'F', pronunciation: 'Foxtrot' },
          { letter: 'G', pronunciation: 'Golf' },
          { letter: 'H', pronunciation: 'Hotel' },
          { letter: 'I', pronunciation: 'India' },
          { letter: 'J', pronunciation: 'Juliet' },
          { letter: 'K', pronunciation: 'Kilo' },
          { letter: 'L', pronunciation: 'Lima' },
          { letter: 'M', pronunciation: 'Mike' },
          { letter: 'N', pronunciation: 'November' },
          { letter: 'O', pronunciation: 'Oscar' },
          { letter: 'P', pronunciation: 'Papa' },
          { letter: 'Q', pronunciation: 'Quebec' },
          { letter: 'R', pronunciation: 'Romeo' },
          { letter: 'S', pronunciation: 'Sierra' },
          { letter: 'T', pronunciation: 'Tango' },
          { letter: 'U', pronunciation: 'Uniform' },
          { letter: 'V', pronunciation: 'Victor' },
          { letter: 'W', pronunciation: 'Whiskey' },
          { letter: 'X', pronunciation: 'X-ray' },
          { letter: 'Y', pronunciation: 'Yankee' },
          { letter: 'Z', pronunciation: 'Zulu' }
        ]
      },
      numberPronunciation: {
        languageSpecific: false,
        examples: [
          { number: '0', pronunciation: 'Zero' },
          { number: '1', pronunciation: 'One' },
          { number: '2', pronunciation: 'Two' },
          { number: '3', pronunciation: 'Three' },
          { number: '4', pronunciation: 'Four' },
          { number: '5', pronunciation: 'Five' },
          { number: '6', pronunciation: 'Six' },
          { number: '7', pronunciation: 'Seven' },
          { number: '8', pronunciation: 'Eight' },
          { number: '9', pronunciation: 'Nine' }
        ]
      },
      commonPhrases: [
        {
          category: 'greeting',
          phrase: 'Good day, this is [CALLSIGN]',
          translation: 'Guten Tag, hier ist [RUFZEICHEN]',
          usageNotes: ['Standard greeting in English amateur radio']
        },
        {
          category: 'identification',
          phrase: 'This is station [CALLSIGN]',
          translation: 'Dies ist Funkstation [RUFZEICHEN]',
          usageNotes: ['Formal identification']
        },
        {
          category: 'request',
          phrase: 'Please respond',
          translation: 'Bitte kommen',
          usageNotes: ['Request for response']
        },
        {
          category: 'confirmation',
          phrase: 'Roger/Roger Wilco',
          translation: 'Verstanden/Werde Folgen',
          usageNotes: ['Acknowledgment of understanding']
        },
        {
          category: 'closing',
          phrase: 'Thank you and 73',
          translation: 'Vielen Dank und 73',
          usageNotes: ['Polite closing with regards']
        },
        {
          category: 'emergency',
          phrase: 'MAYDAY MAYDAY MAYDAY',
          translation: 'MAYDAY MAYDAY MAYDAY',
          usageNotes: ['International distress call']
        }
      ],
      emergencyTerms: [
        {
          term: 'MAYDAY',
          meaning: 'International distress signal',
          internationalUsage: true,
          usageContext: ['Life-threatening situations', 'Severe accidents', 'Crash']
        },
        {
          term: 'PAN PAN',
          meaning: 'Urgency signal',
          internationalUsage: true,
          usageContext: ['Injuries', 'Mechanical problems', 'Important message']
        },
        {
          term: 'SECURITE',
          meaning: 'Safety message',
          internationalUsage: true,
          usageContext: ['Navigation warnings', 'Weather warnings', 'Traffic obstacles']
        }
      ],
      proceduralSignals: [
        {
          signal: 'ROGER',
          meaning: 'Message understood',
          usage: 'Acknowledgment of receipt',
          examples: ['ROGER', 'ROGER WILCO']
        },
        {
          signal: 'WILCO',
          meaning: 'Will comply',
          usage: 'Acknowledgment and agreement to comply',
          examples: ['WILCO', 'ROGER WILCO']
        },
        {
          signal: 'BREAK',
          meaning: 'Interruption',
          usage: 'Indicates a pause or interruption',
          examples: ['BREAK BREAK']
        },
        {
          signal: 'OVER',
          meaning: 'End of transmission, response requested',
          usage: 'End of transmission with response expected',
          examples: ['OVER']
        },
        {
          signal: 'OUT',
          meaning: 'End of transmission, no response requested',
          usage: 'Final transmission without expecting a response',
          examples: ['OUT']
        }
      ],
      qCodes: [
        {
          code: 'QRA',
          meaning: 'What is your callsign?',
          usage: 'Identification',
          examples: ['QRA? = What is your callsign?', 'QRA DL1ABC = My callsign is DL1ABC']
        },
        {
          code: 'QRG',
          meaning: 'Will you tell me my exact frequency in Hz?',
          usage: 'Frequency determination',
          examples: ['QRG 145500 = Your exact frequency is 145.500 MHz']
        },
        {
          code: 'QRL',
          meaning: 'Are you busy?',
          usage: 'Busy?',
          examples: ['QRL? = Are you busy?']
        },
        {
          code: 'QRM',
          meaning: 'Am I being interfered with?',
          usage: 'Interference',
          examples: ['QRM? = Am I being interfered with?']
        },
        {
          code: 'QRN',
          meaning: 'Am I being affected by atmospheric interference?',
          usage: 'Atmospheric interference',
          examples: ['QRN? = Am I being affected by atmospheric interference?']
        },
        {
          code: 'QRP',
          meaning: 'Should I decrease power?',
          usage: 'Power reduction',
          examples: ['QRP? = Should I decrease power?']
        },
        {
          code: 'QRS',
          meaning: 'Should I send slower?',
          usage: 'Slow transmission speed',
          examples: ['QRS? = Should I send slower?']
        },
        {
          code: 'QRV',
          meaning: 'Are you ready?',
          usage: 'Readiness',
          examples: ['QRV = I am ready']
        },
        {
          code: 'QRZ',
          meaning: 'Who is calling me?',
          usage: 'Caller identification',
          examples: ['QRZ DL1ABC = DL1ABC is calling you']
        }
      ],
      abbreviationStandards: [
        {
          abbreviation: '73',
          meaning: 'Best regards',
          usage: 'Polite farewell in amateur radio'
        },
        {
          abbreviation: '88',
          meaning: 'Love and kisses',
          usage: 'Personal farewell'
        },
        {
          abbreviation: 'BK',
          meaning: 'Break',
          usage: 'Interruption in transmission'
        },
        {
          abbreviation: 'CL',
          meaning: 'Closed/Closing',
          usage: 'End of a round'
        },
        {
          abbreviation: 'FB',
          meaning: 'Fine Business/Fantastic',
          usage: 'Excellent performance'
        },
        {
          abbreviation: 'GA',
          meaning: 'Go Ahead',
          usage: 'Please transmit'
        },
        {
          abbreviation: 'K',
          meaning: 'Over',
          usage: 'End of transmission, response requested'
        },
        {
          abbreviation: 'KN',
          meaning: 'Over to Named Station',
          usage: 'End, respond only to specific station'
        },
        {
          abbreviation: 'R',
          meaning: 'Roger/Received',
          usage: 'Message received and understood'
        },
        {
          abbreviation: 'SK',
          meaning: 'Silent Key/End',
          usage: 'End of QSO round or in memoriam for deceased hams'
        }
      ]
    };
  }
  
  // Internationales Notfallprotokoll
  getInternationalProtocol(): LanguageProtocol {
    return {
      language: 'international',
      name: 'International Emergency Protocol',
      phoneticAlphabet: {
        name: 'ITU Phonetic Alphabet',
        letters: [
          // Verwendet das NATO-Alphabet als Standard
          { letter: 'A', pronunciation: 'Alpha' },
          { letter: 'B', pronunciation: 'Bravo' },
          { letter: 'C', pronunciation: 'Charlie' },
          { letter: 'D', pronunciation: 'Delta' },
          { letter: 'E', pronunciation: 'Echo' },
          { letter: 'F', pronunciation: 'Foxtrot' },
          { letter: 'G', pronunciation: 'Golf' },
          { letter: 'H', pronunciation: 'Hotel' },
          { letter: 'I', pronunciation: 'India' },
          { letter: 'J', pronunciation: 'Juliet' },
          { letter: 'K', pronunciation: 'Kilo' },
          { letter: 'L', pronunciation: 'Lima' },
          { letter: 'M', pronunciation: 'Mike' },
          { letter: 'N', pronunciation: 'November' },
          { letter: 'O', pronunciation: 'Oscar' },
          { letter: 'P', pronunciation: 'Papa' },
          { letter: 'Q', pronunciation: 'Quebec' },
          { letter: 'R', pronunciation: 'Romeo' },
          { letter: 'S', pronunciation: 'Sierra' },
          { letter: 'T', pronunciation: 'Tango' },
          { letter: 'U', pronunciation: 'Uniform' },
          { letter: 'V', pronunciation: 'Victor' },
          { letter: 'W', pronunciation: 'Whiskey' },
          { letter: 'X', pronunciation: 'X-ray' },
          { letter: 'Y', pronunciation: 'Yankee' },
          { letter: 'Z', pronunciation: 'Zulu' }
        ]
      },
      numberPronunciation: {
        languageSpecific: false,
        examples: [
          { number: '0', pronunciation: 'Zero' },
          { number: '1', pronunciation: 'One' },
          { number: '2', pronunciation: 'Two' },
          { number: '3', pronunciation: 'Three' },
          { number: '4', pronunciation: 'Four' },
          { number: '5', pronunciation: 'Five' },
          { number: '6', pronunciation: 'Six' },
          { number: '7', pronunciation: 'Seven' },
          { number: '8', pronunciation: 'Eight' },
          { number: '9', pronunciation: 'Nine' }
        ]
      },
      commonPhrases: [
        {
          category: 'emergency',
          phrase: 'MAYDAY MAYDAY MAYDAY [CALLSIGN]',
          translation: 'SOS SOS SOS [RUFZEICHEN]',
          usageNotes: ['International distress call - repeated three times']
        },
        {
          category: 'emergency',
          phrase: 'PAN PAN PAN [CALLSIGN]',
          translation: 'PAN PAN PAN [RUFZEICHEN]',
          usageNotes: ['International urgency signal - repeated three times']
        },
        {
          category: 'emergency',
          phrase: 'SECURITE SECURITE SECURITE [CALLSIGN]',
          translation: 'SECURITE SECURITE SECURITE [RUFZEICHEN]',
          usageNotes: ['International safety signal - repeated three times']
        },
        {
          category: 'emergency',
          phrase: '[CALLSIGN] DISTRESS [TIME] [LOCATION] [NATURE OF DISTRESS] [ASSISTANCE REQUIRED]',
          translation: '[RUFZEICHEN] NOTFALL [ZEIT] [ORT] [ART DES NOTFALLS] [HILFE BENÖTIGT]',
          usageNotes: ['Standard distress message format']
        }
      ],
      emergencyTerms: [
        {
          term: 'MAYDAY',
          meaning: 'Distress signal indicating life-threatening situation',
          internationalUsage: true,
          usageContext: [
            'Maritime distress',
            'Aviation emergencies',
            'Land-based emergencies',
            'Medical emergencies'
          ]
        },
        {
          term: 'PAN PAN',
          meaning: 'Urgency signal indicating important but non-life-threatening situation',
          internationalUsage: true,
          usageContext: [
            'Medical assistance required',
            'Mechanical difficulties',
            'Navigation problems'
          ]
        },
        {
          term: 'SECURITE',
          meaning: 'Safety signal for important navigational or meteorological warnings',
          internationalUsage: true,
          usageContext: [
            'Traffic hazards',
            'Weather warnings',
            'Navigation dangers'
          ]
        }
      ],
      proceduralSignals: [
        {
          signal: 'DISTRESS RELAY',
          meaning: 'Relaying a distress message',
          usage: 'Forwarding emergency communications',
          examples: ['DISTRESS RELAY FROM [ORIGINAL_CALLSIGN]']
        },
        {
          signal: 'SILENCE FINI',
          meaning: 'End of silence period',
          usage: 'Ending mandatory listening period for distress traffic',
          examples: ['SILENCE FINI']
        },
        {
          signal: 'PRUDENTIARY SILENCE',
          meaning: 'Voluntary silence for distress traffic',
          usage: 'Non-mandatory but recommended silence',
          examples: ['PRUDENTIARY SILENCE']
        }
      ],
      qCodes: [
        // Q-Codes für Notfallkommunikation
        {
          code: 'QRR',
          meaning: 'Are you experiencing communication difficulties?',
          usage: 'Checking if station needs emergency assistance',
          examples: ['QRR?']
        },
        {
          code: 'QRU',
          meaning: 'Have you anything for me?',
          usage: 'Asking if messages or assistance available',
          examples: ['QRU?']
        }
      ],
      abbreviationStandards: [
        {
          abbreviation: 'SOS',
          meaning: 'International distress signal ( Morse: ···−−−··· )',
          usage: 'Maritime and aviation emergencies'
        },
        {
          abbreviation: 'NC',
          meaning: 'No Change',
          usage: 'Indicating no change in conditions or status'
        },
        {
          abbreviation: 'WX',
          meaning: 'Weather',
          usage: 'Meteorological information'
        }
      ]
    };
  }
  
  // Speichere Sprachprotokolle
  saveProtocols(protocols: LanguageProtocol[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(protocols));
      console.log('[Language] Protocols saved successfully');
    } catch (error) {
      console.error('[Language] Error saving protocols:', error);
    }
  }
  
  // Lade Sprachprotokolle
  loadProtocols(): LanguageProtocol[] | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Protokolle zurückgeben
      const defaultProtocols = this.getDefaultProtocols();
      this.saveProtocols(defaultProtocols);
      return defaultProtocols;
    } catch (error) {
      console.error('[Language] Error loading protocols:', error);
      return null;
    }
  }
  
  // Hole Protokoll nach Sprache
  getProtocolByLanguage(language: string): LanguageProtocol | null {
    const protocols = this.loadProtocols();
    if (!protocols) return null;
    
    return protocols.find(proto => proto.language === language) || null;
  }
  
  // Hole Buchstabieralphabet für eine Sprache
  getPhoneticAlphabet(language: string): PhoneticAlphabet | null {
    const protocol = this.getProtocolByLanguage(language);
    return protocol?.phoneticAlphabet || null;
  }
  
  // Buchstabiere ein Wort mit dem entsprechenden Alphabet
  spellWord(word: string, language: string = 'de'): string {
    const alphabet = this.getPhoneticAlphabet(language);
    if (!alphabet) return word;
    
    return word.toUpperCase().split('').map(char => {
      const letter = alphabet.letters.find(l => l.letter === char);
      return letter ? letter.pronunciation : char;
    }).join('-');
  }
  
  // Hole Q-Codes für eine Sprache
  getQCodes(language: string): QCode[] | null {
    const protocol = this.getProtocolByLanguage(language);
    return protocol?.qCodes || null;
  }
  
  // Suche nach Q-Code Bedeutung
  getQCodeMeaning(code: string, language: string = 'de'): QCode | null {
    const qCodes = this.getQCodes(language);
    if (!qCodes) return null;
    
    return qCodes.find(q => q.code === code.toUpperCase()) || null;
  }
  
  // Hole Notfallbegriffe für eine Sprache
  getEmergencyTerms(language: string): EmergencyTerm[] | null {
    const protocol = this.getProtocolByLanguage(language);
    return protocol?.emergencyTerms || null;
  }
  
  // Suche nach Notfallbegriff
  getEmergencyTerm(term: string, language: string = 'de'): EmergencyTerm | null {
    const terms = this.getEmergencyTerms(language);
    if (!terms) return null;
    
    return terms.find(t => t.term.toUpperCase() === term.toUpperCase()) || null;
  }
  
  // Hole gängige Phrasen nach Kategorie
  getPhrasesByCategory(category: CommonPhrase['category'], language: string = 'de'): CommonPhrase[] | null {
    const protocol = this.getProtocolByLanguage(language);
    if (!protocol) return null;
    
    return protocol.commonPhrases.filter(phrase => phrase.category === category);
  }
  
  // Exportiere Sprachprotokolle als JSON
  exportProtocols(): string {
    const protocols = this.loadProtocols();
    
    return JSON.stringify({
      protocols,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Importiere Sprachprotokolle aus JSON
  importProtocols(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.protocols) {
        this.saveProtocols(data.protocols);
      }
      
      console.log('[Language] Protocols imported successfully');
      return true;
    } catch (error) {
      console.error('[Language] Error importing protocols:', error);
      return false;
    }
  }
  
  // Generiere einen Sprachführer für eine bestimmte Sprache
  generateLanguageGuide(language: string): string {
    const protocol = this.getProtocolByLanguage(language);
    if (!protocol) return `Kein Sprachprotokoll für ${language} gefunden.`;
    
    let guide = `=== SPRACHFÜHRER: ${protocol.name.toUpperCase()} ===\n\n`;
    
    // Buchstabieralphabet
    guide += 'BUCHSTABIERALPHABET:\n';
    protocol.phoneticAlphabet.letters.forEach(letter => {
      guide += `${letter.letter} = ${letter.pronunciation}\n`;
    });
    
    guide += '\nZAHLENAussprache:\n';
    protocol.numberPronunciation.examples.forEach(example => {
      guide += `${example.number} = ${example.pronunciation}\n`;
    });
    
    guide += '\nWICHTIGE PHRASEN:\n';
    protocol.commonPhrases.forEach(phrase => {
      guide += `${phrase.phrase} (${phrase.translation})\n`;
      if (phrase.usageNotes) {
        phrase.usageNotes.forEach(note => {
          guide += `  → ${note}\n`;
        });
      }
      guide += '\n';
    });
    
    guide += 'NOTFALLBEGRIFFE:\n';
    protocol.emergencyTerms.forEach(term => {
      guide += `${term.term}: ${term.meaning}\n`;
      if (term.usageContext.length > 0) {
        guide += `  Kontext: ${term.usageContext.join(', ')}\n`;
      }
      guide += '\n';
    });
    
    guide += 'Q-CODES:\n';
    protocol.qCodes.forEach(qcode => {
      guide += `${qcode.code}: ${qcode.meaning}\n`;
      guide += `  Beispiel: ${qcode.examples.join(', ')}\n\n`;
    });
    
    return guide;
  }
}

// Export des Managers
export const languageProtocolsManager = new LanguageProtocolsManager();

// Initialisierung
console.log('[Language] LanguageProtocolsManager initialized');

// Beispiel für die Verwendung:
/*
// Lade alle Sprachprotokolle
const protocols = languageProtocolsManager.loadProtocols();
console.log('Language protocols loaded:', protocols);

// Hole Buchstabieralphabet für Deutsch
const germanAlphabet = languageProtocolsManager.getPhoneticAlphabet('de');
console.log('German phonetic alphabet:', germanAlphabet);

// Buchstabiere ein Rufzeichen
const spelled = languageProtocolsManager.spellWord('DL1ABC', 'de');
console.log('Spelled callsign:', spelled);

// Suche nach Q-Code Bedeutung
const qCode = languageProtocolsManager.getQCodeMeaning('QRA', 'de');
console.log('QRA meaning:', qCode);

// Generiere Sprachführer
const guide = languageProtocolsManager.generateLanguageGuide('de');
console.log('German language guide:', guide);
*/