'use strict';


//dependencies
const path = require('path');
const faker = require('faker');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sinon = require('sinon');
const expect = require('chai').expect;

const rootPath = path.join(__dirname, '..', '..');
const libsPath = path.join(rootPath, 'lib');
const patch = require(path.join(libsPath, 'patch'));

describe('unit#patch', () => {

  const PatchableSchema = new Schema({
    name: { type: String }
  });

  PatchableSchema.methods.beforePatch = (updates, done) => {
    done();
  };

  PatchableSchema.methods.afterPatch = (updates, done) => {
    done();
  };

  PatchableSchema.plugin(patch);

  const Patchable = mongoose.model('Patchable', PatchableSchema);

  describe('export', () => {
    it('should be a function', () => {
      expect(patch).to.be.a('function');
    });

    it('should have name patch', () => {
      expect(patch.name).to.be.equal('patchPlugin');
    });

    it('should have length of 1', () => {
      expect(patch.length).to.be.equal(1);
    });
  });

  describe('instance#patch', () => {

    const updates = { name: faker.name.firstName() };
    const patchable = new Patchable({ name: faker.name.firstName() });

    let save;
    let patch;
    let beforePatch;
    let afterPatch;

    beforeEach(() => {
      save = sinon.mock(patchable)
        .expects('save').yields(null, patchable);
      patch = sinon.spy(patchable, 'patch');
      beforePatch = sinon.spy(patchable, 'beforePatch');
      afterPatch = sinon.spy(patchable, 'afterPatch');
    });

    afterEach(() => {
      save.restore();
      patch.restore();
      beforePatch.restore();
      afterPatch.restore();
    });

    it('should be able to patch(update)', (done) => {
      patchable.patch(updates, (error, updated) => {

        expect(beforePatch).to.have.been.called;
        expect(beforePatch).to.have.been.calledOnce;
        expect(beforePatch).to.have.been.calledWith(updates);

        expect(save).to.have.been.called;
        expect(save).to.have.been.calledOnce;

        expect(patch).to.have.been.called;
        expect(patch).to.have.been.calledOnce;
        expect(patch).to.have.been.calledWith(updates);

        expect(afterPatch).to.have.been.called;
        expect(afterPatch).to.have.been.calledOnce;
        expect(afterPatch).to.have.been.calledWith(updates);

        done(error, updated);

      });

    });

  });


  describe('static#patch', () => {

    const updates = {
      _id: new mongoose.Types.ObjectId(),
      name: faker.name.firstName()
    };
    const patchable = new Patchable(updates);

    let patch;

    beforeEach(() => {
      patch = sinon.mock(Patchable)
        .expects('patch').yields(null, patchable);
    });

    afterEach(() => {
      patch.restore();
    });

    it('should be able to patch(update)', (done) => {
      Patchable
        .patch(updates, (error, created) => {

          expect(patch).to.have.been.called;
          expect(patch).to.have.been.calledOnce;
          expect(patch).to.have.been.calledWith(updates);

          done(error, created);

        });

    });

  });

});