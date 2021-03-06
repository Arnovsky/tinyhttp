import { App } from '../../packages/app/src'
import { logger } from '../../packages/logger/src'
import colors from 'colors'
import supertest from 'supertest'


describe('Logger tests', () => {
  it('should use the timestamp format specified in the `format` property', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: { format: 'mm:ss' } }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })
  it('should enable timestamp if `timestanmp` propery is true', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: true }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })

  it('should call a custom output function', (done) => {

    const customOutput = (log: string) => {
      expect(log).toMatch('GET 404 Not Found /')
      done()
    }

    const app = new App()
    app.use(logger({ output: { callback: customOutput, color: false } }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })

  describe('Color logs', () => {

    const createColorTest = (status, color, done) => {
      return () => {
        const customOutput = (log: string) => {
          expect(log.split(' ')[1]).toMatch(colors[color].bold(status))
          done()
        }
  
        const app = new App()

        app.use(logger({ output: { callback: customOutput, color: true } }))
        app.get('/', (_, res) => res.status(status).send(''))

        const server = app.listen()
  
        const request = supertest(server)
  
        request
          .get('/')
          .expect(status)
          .end(() => {
            server.close()
          })
      };
    };

    it('should color 2xx cyan', (done) => {
      createColorTest(200, 'cyan', done)();
    })

    it('should color 4xx red', (done) => {
      createColorTest(400, 'red', done)();
    })
    
    it('should color 5xx magenta', (done) => {
      createColorTest(500, 'magenta', done)();
    })
  })
})
