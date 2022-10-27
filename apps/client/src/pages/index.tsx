import dynamic from "next/dynamic"
import { useAtom } from "jotai"
import Router from "next/router"

import { gameStateAtom } from "../atoms"
import useSocket from "../hooks/use-socket"
import useSnackbar from "../components/snackbar/use"
import mapErrorMessage from "../functions/map-error-message"

import Entry from "../screens/entry"

import type { NextPage } from "next"
import type { Message as SendMessage } from "@kado/schemas/dist/client/send"
import type { Message as ReceiveMessage } from "@kado/schemas/dist/client/receive"

const Game = dynamic(() => import("../screens/game"), { ssr: false })
const Waiting = dynamic(() => import("../screens/waiting"), { ssr: false })

const Home: NextPage = () => {
  const { updateSnackbar, Snackbar } = useSnackbar()
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const gameStatus = gameState?.status

  useSocket<SendMessage, ReceiveMessage>({
    onClose() {
      setGameState(null)
      updateSnackbar({
        message: "Упс, пропало соединение. Пытаемся его восстановить",
        severity: "error",
        open: true
      })
    },
    onJsonMessage(data) {
      if (data.type == "error" && data.details) {
        updateSnackbar({
          message: mapErrorMessage(data.details),
          open: true
        })
      }

      if (data.type == "joined") {
        Router.replace(Router.pathname, undefined, { shallow: true })
      }

      if (data.type == "joined" || data.type == "created") {
        setGameState({
          ...data.details,
          votes: [],
          redCard: null,
          whiteCards:
            "whiteCards" in data.details ? data.details.whiteCards : []
        })
      } else if ("details" in data && data.type != "error" && data.details) {
        setGameState((prev) => (prev ? { ...prev, ...data.details } : null))
      }
    }
  })

  const waiting =
    gameStatus == "waiting" || gameStatus == "end" || gameStatus == "starting"

  return (
    <>
      {Snackbar}
      {!gameState && <Entry />}
      {waiting && <Waiting />}
      {!waiting && <Game />}
    </>
  )
}

export default Home
