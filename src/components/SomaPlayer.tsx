import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, Radio, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamMetadataReader, getMetadataViaProxy, type TrackMetadata } from '@/utils/streamMetadata';

interface StreamQuality {
  bitrate: string;
  url: string;
}

interface SomaStation {
  id: string;
  title: string;
  description: string;
  genre: string;
  streams: StreamQuality[];
}

interface NowPlaying {
  title: string;
  artist: string;
  album?: string;
  lastUpdated: number;
}

const somaStations: SomaStation[] = [
  // WSZYSTKIE stacje Soma FM (42 stacje)
  {
    id: 'groovesalad',
    title: 'Groove Salad',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves.',
    genre: 'Ambient/Downtempo',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/groovesalad/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/groovesalad-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/groovesalad-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/groovesalad-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/groovesalad-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/groovesalad-32-aac' }
    ]
  },
  {
    id: 'dronezone',
    title: 'Drone Zone',
    description: 'Served best chilled, safe with most medications. Atmospheric textures with minimal beats.',
    genre: 'Ambient',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/dronezone/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/dronezone-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/dronezone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/dronezone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/dronezone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/dronezone-32-aac' }
    ]
  },
  {
    id: 'spacestation',
    title: 'Space Station Soma',
    description: 'Tune in, turn on, space out. Spaced-out ambient and mid-tempo electronica.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/spacestation/FLAC/program.m3u8' },
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/spacestation-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/spacestation-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/spacestation-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/spacestation-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/spacestation-32-aac' }
    ]
  },
  {
    id: 'indiepop',
    title: 'Indie Pop Rocks!',
    description: 'New and classic favorite indie pop tracks.',
    genre: 'Alternative/Rock',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/indiepop/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/indiepop-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/indiepop-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/indiepop-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/indiepop-32-aac' }
    ]
  },
  {
    id: 'u80s',
    title: 'Underground 80s',
    description: 'Early 80s UK Synthpop and a bit of New Wave.',
    genre: 'Alternative/Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/u80s/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/u80s-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/u80s-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/u80s-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/u80s-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/u80s-32-aac' }
    ]
  },
  {
    id: 'gsclassic',
    title: 'Groove Salad Classic',
    description: 'The classic (early 2000s) version of a nicely chilled plate of ambient/downtempo beats and grooves.',
    genre: 'Ambient/Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/gsclassic/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/gsclassic-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/gsclassic-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/gsclassic-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/gsclassic-32-aac' }
    ]
  },
  {
    id: 'deepspaceone',
    title: 'Deep Space One',
    description: 'Deep ambient electronic, experimental and space music. For inner and outer space exploration.',
    genre: 'Ambient',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/deepspaceone/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/deepspaceone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/deepspaceone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/deepspaceone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/deepspaceone-32-aac' }
    ]
  },
  {
    id: 'synphaera',
    title: 'Synphaera Radio',
    description: 'Featuring the music from an independent record label focused on modern electronic ambient and space music.',
    genre: 'Ambient/Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/synphaera/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/synphaera-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/synphaera-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/synphaera-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/synphaera-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/synphaera-32-aac' }
    ]
  },
  {
    id: 'darkzone',
    title: 'The Dark Zone',
    description: 'The darker side of deep ambient. Music for staring into the Abyss.',
    genre: 'Ambient',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/darkzone/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/darkzone-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/darkzone-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/darkzone-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/darkzone-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/darkzone-32-aac' }
    ]
  },
  {
    id: 'lush',
    title: 'Lush',
    description: 'Sensuous and mellow female vocals, many with an electronic influence.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/lush/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/lush-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/lush-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/lush-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/lush-32-aac' }
    ]
  },
  {
    id: 'defcon',
    title: 'DEF CON Radio',
    description: 'Music for Hacking. The DEF CON Year-Round Channel.',
    genre: 'Electronic/Specials',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/defcon/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/defcon-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/defcon-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/defcon-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/defcon-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/defcon-32-aac' }
    ]
  },
  {
    id: 'seventies',
    title: 'Left Coast 70s',
    description: 'Mellow album rock from the Seventies. Yacht not required.',
    genre: '70s/Rock',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/seventies/FLAC/program.m3u8' },
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/seventies-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/seventies-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/seventies-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/seventies-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/seventies-32-aac' }
    ]
  },
  {
    id: 'folkfwd',
    title: 'Folk Forward',
    description: 'Indie Folk, Alt-folk and the occasional folk classics.',
    genre: 'Folk/Alternative',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/folkfwd/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/folkfwd-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/folkfwd-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/folkfwd-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/folkfwd-32-aac' }
    ]
  },
  {
    id: 'beatblender',
    title: 'Beat Blender',
    description: 'A late night blend of deep-house and downtempo chill.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/beatblender/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/beatblender-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/beatblender-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/beatblender-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/beatblender-32-aac' }
    ]
  },
  {
    id: 'bootliquor',
    title: 'Boot Liquor',
    description: 'Americana Roots music for Cowhands, Cowpokes and Cowtippers',
    genre: 'Americana',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/bootliquor/FLAC/program.m3u8' },
      { bitrate: '320k MP3', url: 'https://ice5.somafm.com/bootliquor-320-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/bootliquor-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/bootliquor-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/bootliquor-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/bootliquor-32-aac' }
    ]
  },
  {
    id: 'thetrip',
    title: 'The Trip',
    description: 'Progressive house / trance. Tip top tunes.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/thetrip/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/thetrip-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/thetrip-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/thetrip-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/thetrip-32-aac' }
    ]
  },
  {
    id: 'suburbsofgoa',
    title: 'Suburbs of Goa',
    description: 'Desi-influenced Asian world beats and beyond.',
    genre: 'World',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/suburbsofgoa/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/suburbsofgoa-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/suburbsofgoa-32-aac' }
    ]
  },
  {
    id: 'thistle',
    title: 'ThistleRadio',
    description: 'Exploring music from Celtic roots and branches',
    genre: 'Celtic/World',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/thistle/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/thistle-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/thistle-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/thistle-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/thistle-32-aac' }
    ]
  },
  {
    id: 'bossa',
    title: 'Bossa Beyond',
    description: 'Silky-smooth, laid-back Brazilian-style rhythms of Bossa Nova, Samba and beyond',
    genre: 'Bossanova/World',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/bossa/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/bossa-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/bossa-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/bossa-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/bossa-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/bossa-32-aac' }
    ]
  },
  {
    id: 'sonicuniverse',
    title: 'Sonic Universe',
    description: 'Transcending the world of jazz with eclectic, avant-garde takes on tradition.',
    genre: 'Jazz',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/sonicuniverse/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/sonicuniverse-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/sonicuniverse-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/sonicuniverse-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/sonicuniverse-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/sonicuniverse-32-aac' }
    ]
  },
  {
    id: 'poptron',
    title: 'PopTron',
    description: 'Electropop and indie dance rock with sparkle and pop.',
    genre: 'Alternative',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/poptron/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/poptron-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/poptron-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/poptron-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/poptron-32-aac' }
    ]
  },
  {
    id: 'reggae',
    title: 'Heavyweight Reggae',
    description: 'Reggae, Ska, Rocksteady classic and deep tracks.',
    genre: 'Reggae',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/reggae/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/reggae-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/reggae-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/reggae-128-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/reggae-32-aac' }
    ]
  },
  {
    id: 'fluid',
    title: 'Fluid',
    description: 'Drown in the electronic sound of instrumental hiphop, future soul and liquid trap.',
    genre: 'Electronic/Hip-Hop',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/fluid/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/fluid-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/fluid-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/fluid-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/fluid-32-aac' }
    ]
  },
  {
    id: 'vaporwaves',
    title: 'Vaporwaves',
    description: 'All Vaporwave. All the time.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/vaporwaves/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/vaporwaves-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/vaporwaves-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/vaporwaves-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/vaporwaves-32-aac' }
    ]
  },
  {
    id: 'cliqhop',
    title: 'cliqhop idm',
    description: "Blips'n'beeps backed mostly w/beats. Intelligent Dance Music.",
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/cliqhop/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/cliqhop-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/cliqhop-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/cliqhop-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/cliqhop-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/cliqhop-32-aac' }
    ]
  },
  {
    id: 'missioncontrol',
    title: 'Mission Control',
    description: 'Celebrating NASA and Space Explorers everywhere.',
    genre: 'Ambient/Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/missioncontrol/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/missioncontrol-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/missioncontrol-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/missioncontrol-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/missioncontrol-32-aac' }
    ]
  },
  {
    id: 'sf1033',
    title: 'SF 10-33',
    description: 'Ambient music mixed with the sounds of San Francisco public safety radio traffic.',
    genre: 'Ambient/News',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/sf1033/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/sf1033-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/sf1033-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/sf103364-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/sf103332-32-aac' }
    ]
  },
  {
    id: 'doomed',
    title: 'Doomed',
    description: 'Where every day is Halloween: Dark industrial/ambient music for tortured souls.',
    genre: 'Ambient/Industrial',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/doomed/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/doomed-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/doomed-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/doomed-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/doomed-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/doomed-32-aac' }
    ]
  },
  {
    id: 'chillits',
    title: 'Chillits Radio',
    description: 'Celebrating 25 years of music, chilling and camping',
    genre: 'Chill/Live',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/chillits/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/chillits-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/chillits-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/chillits-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/chillits-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/chillits-32-aac' }
    ]
  },
  {
    id: 'brfm',
    title: 'Black Rock FM',
    description: 'From the Playa to the world, for the annual Burning Man festival.',
    genre: 'Eclectic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/brfm/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/brfm-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/brfm-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/brfm-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/brfm-32-aac' }
    ]
  },
  {
    id: 'covers',
    title: 'Covers',
    description: "Just covers. Songs you know by artists you don't. We've got you covered.",
    genre: 'Eclectic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/covers/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/covers-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/covers-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/covers-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/covers-32-aac' }
    ]
  },
  {
    id: 'digitalis',
    title: 'Digitalis',
    description: 'Digitally affected analog rock to calm the agitated heart.',
    genre: 'Electronic/Alternative',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/digitalis/FLAC/program.m3u8' },
      { bitrate: '256k MP3', url: 'https://ice5.somafm.com/digitalis-256-mp3' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/digitalis-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/digitalis-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/digitalis-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/digitalis-32-aac' }
    ]
  },
  {
    id: 'illstreet',
    title: 'Illinois Street Lounge',
    description: 'Classic bachelor pad, playful exotica and vintage music of tomorrow.',
    genre: 'Lounge',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/illstreet/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/illstreet-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/illstreet-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/illstreet-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/illstreet-32-aac' }
    ]
  },
  {
    id: 'secretagent',
    title: 'Secret Agent',
    description: 'The soundtrack for your stylish, mysterious, dangerous life. For Spies and PIs too!',
    genre: 'Lounge',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/secretagent/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/secretagent-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/secretagent-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/secretagent-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/secretagent-32-aac' }
    ]
  },
  {
    id: 'metal',
    title: 'Metal Detector',
    description: 'From black to doom, prog to sludge, thrash to post, stoner to crossover, punk to industrial.',
    genre: 'Metal',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/metal/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/metal-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/metal-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/metal-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/metal-32-aac' }
    ]
  },
  {
    id: 'n5md',
    title: 'n5MD Radio',
    description: 'Emotional Experiments in Music: Ambient, modern composition, post-rock, & experimental electronic music',
    genre: 'Experimental',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/n5md/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/n5md-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/n5md-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/n5md-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/n5md-32-aac' }
    ]
  },
  {
    id: '7soul',
    title: 'Seven Inch Soul',
    description: 'Vintage soul tracks from the original 45 RPM vinyl.',
    genre: 'Soul/Funk',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/7soul/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/7soul-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/7soul-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/7soul-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/7soul-32-aac' }
    ]
  },
  {
    id: 'dubstep',
    title: 'Dub Step Beyond',
    description: 'Dubstep, Dub and Deep Bass. May damage speakers at high volume.',
    genre: 'Electronic',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/dubstep/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/dubstep-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/dubstep-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/dubstep-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/dubstep-32-aac' }
    ]
  },
  {
    id: 'insound',
    title: 'The In-Sound',
    description: '60s/70s Hipster Euro Pop where psychedelic melodies meets groovy vibes.',
    genre: 'Lounge',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/insound/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/insound-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/insound-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/insound-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/insound-32-aac' }
    ]
  },
  {
    id: 'tikitime',
    title: 'Tiki Time',
    description: 'Classic Tiki music and Vintage island rhythms to sip cocktails by.',
    genre: 'Lounge',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/tikitime/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/tikitime-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/tikitime-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/tikitime-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/tikitime-32-aac' }
    ]
  },
  {
    id: 'live',
    title: 'SomaFM Live',
    description: 'Special Live Events and rebroadcasts of past live events',
    genre: 'Specials/Live',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/live/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/live-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/live-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/live-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/live-32-aac' }
    ]
  },
  {
    id: 'specials',
    title: 'SomaFM Specials',
    description: 'Now featuring Afternoon Jazz, Wavepool, DubX, The Surf Report & More!',
    genre: 'Specials',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/specials/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/specials-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/specials-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/specials-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/specials-32-aac' }
    ]
  },
  {
    id: 'sfinsf',
    title: 'SF in SF',
    description: 'Author readings and discussions from the science fiction, fantasy, horror, and genre literary fields.',
    genre: 'Spoken Word',
    streams: [
      { bitrate: 'FLAC HLS', url: 'https://hls.somafm.com/hls/sfinsf/FLAC/program.m3u8' },
      { bitrate: '128k MP3', url: 'https://ice5.somafm.com/sfinsf-128-mp3' },
      { bitrate: '128k AAC', url: 'https://ice5.somafm.com/sfinsf-128-aac' },
      { bitrate: '64k AAC', url: 'https://ice5.somafm.com/sfinsf-64-aac' },
      { bitrate: '32k AAC', url: 'https://ice5.somafm.com/sfinsf-32-aac' }
    ]
  }
];

export const SomaPlayer = () => {
  const [currentStation, setCurrentStation] = useState<SomaStation | null>(null);
  const [currentStream, setCurrentStream] = useState<StreamQuality | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nowPlayingInterval = useRef<NodeJS.Timeout | null>(null);
  const metadataReader = useRef<StreamMetadataReader>(new StreamMetadataReader());

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'none';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (nowPlayingInterval.current) {
        clearInterval(nowPlayingInterval.current);
      }
      metadataReader.current.abort();
    };
  }, []);

  // Fetch real now playing info from stream metadata
  const fetchNowPlaying = async (station: SomaStation, streamUrl: string) => {
    try {
      console.log(`Fetching metadata for ${station.title}...`);
      
      // Try multiple methods to get metadata
      let metadata: TrackMetadata | null = null;
      
      // Method 1: Try SomaFM's JSON endpoint
      try {
        metadata = await getMetadataViaProxy(station.id);
        console.log('Got metadata via SomaFM API:', metadata);
      } catch (error) {
        console.log('SomaFM API failed, trying stream metadata...');
      }
      
      // Method 2: Try reading from stream directly (may fail due to CORS)
      if (!metadata) {
        try {
          metadata = await metadataReader.current.getMetadata(streamUrl);
          console.log('Got metadata from stream:', metadata);
        } catch (error) {
          console.log('Stream metadata failed:', error);
        }
      }
      
      if (metadata) {
        setNowPlaying({
          ...metadata,
          lastUpdated: Date.now()
        });
      } else {
        console.log('No metadata available, keeping current info');
      }
    } catch (error) {
      console.error('Error fetching now playing:', error);
    }
  };

  const playStation = async (station: SomaStation, stream?: StreamQuality) => {
    if (!audioRef.current) return;

    const selectedStream = stream || station.streams[0]; // Default to first (highest quality)
    setIsLoading(true);
    
    try {
      // Stop current stream
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Clear existing interval
      if (nowPlayingInterval.current) {
        clearInterval(nowPlayingInterval.current);
      }
      
      // Set new station
      setCurrentStation(station);
      setCurrentStream(selectedStream);
      audioRef.current.src = selectedStream.url;
      
      console.log(`Playing ${station.title} at ${selectedStream.bitrate}: ${selectedStream.url}`);
      
      // Play new stream
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Fetch now playing info immediately and then every 30 seconds
      fetchNowPlaying(station, selectedStream.url);
      nowPlayingInterval.current = setInterval(() => {
        fetchNowPlaying(station, selectedStream.url);
      }, 3000); // Updated to 3 seconds
      
    } catch (error) {
      console.error('Error playing station:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentStation) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentStation(null);
    setCurrentStream(null);
    setNowPlaying(null);
    
    if (nowPlayingInterval.current) {
      clearInterval(nowPlayingInterval.current);
      nowPlayingInterval.current = null;
    }
    
    metadataReader.current.abort();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-darker to-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Soma FM
          </h1>
          <p className="text-muted-foreground">Underground/Alternative Radio</p>
        </div>

        {/* Current Playing */}
        {currentStation && (
          <Card className="bg-gradient-surface border-border/50 shadow-glow">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Radio className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{currentStation.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentStation.genre}</p>
                  {currentStream && (
                    <p className="text-xs text-primary">{currentStream.bitrate}</p>
                  )}
                </div>
              </div>

              {/* Now Playing Track Info */}
              {nowPlaying && (
                <div className="bg-background/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Now Playing</span>
                  </div>
                  <p className="font-medium text-sm">{nowPlaying.title}</p>
                  <p className="text-sm text-muted-foreground">{nowPlaying.artist}</p>
                  {nowPlaying.album && (
                    <p className="text-xs text-muted-foreground opacity-75">{nowPlaying.album}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="bg-background/50 border-primary/30 hover:bg-primary/10"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopPlayback}
                  className="bg-background/50 border-destructive/30 hover:bg-destructive/10"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Station List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Stations ({somaStations.length})</h2>
          {somaStations.map((station) => (
            <Card
              key={station.id}
              className={cn(
                "bg-card/80 border-border/50 cursor-pointer transition-all hover:shadow-glow hover:scale-105",
                currentStation?.id === station.id && "ring-2 ring-primary shadow-neon"
              )}
            >
              <div className="p-4 space-y-3">
                <div 
                  className="space-y-2"
                  onClick={() => playStation(station)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{station.title}</h3>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {station.genre}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {station.description}
                  </p>
                </div>
                
                {/* Stream Quality Options */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-border/30">
                  {station.streams.map((stream) => (
                    <Button
                      key={stream.bitrate}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playStation(station, stream);
                      }}
                      className={cn(
                        "text-xs bg-background/50 border-border/50 hover:bg-primary/10",
                        currentStation?.id === station.id && 
                        currentStream?.bitrate === stream.bitrate && 
                        "bg-primary/20 border-primary/50"
                      )}
                    >
                      {stream.bitrate}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};