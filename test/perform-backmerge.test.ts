import {performBackmerge} from "../src/perform-backmerge";
import Git from "../src/helpers/git";
import {instance, mock, verify, when, anyString, anything} from "ts-mockito";

class NullLogger {
    log(message) {}
    error(message) {}
}

describe("perform-backmerge", () => {
    it("works with correct configuration", (done) => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles()).thenResolve([]);
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};
        performBackmerge(instance(mockedGit), {branchName: 'develop'}, context)
            .then(() => {
                verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
                verify(mockedGit.checkout('master')).once();
                verify(mockedGit.configFetchAllRemotes()).once();
                verify(mockedGit.fetch(context.options.repositoryUrl)).once();
                verify(mockedGit.checkout('develop')).once();
                verify(mockedGit.rebase('master')).once();
                verify(mockedGit.push('my-repo', 'develop', false)).once();
                done();
            })
            .catch((error) => done(error));
    });

    it("merge into the same branch", (done) => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles()).thenResolve([]);
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};
        performBackmerge(instance(mockedGit), {branchName: 'master', allowSameBranchMerge: true}, context)
            .then(() => {
                verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "master".')).once();
                verify(mockedGit.configFetchAllRemotes()).once();
                verify(mockedGit.fetch(context.options.repositoryUrl)).once();
                verify(mockedGit.checkout('master')).once();
                verify(mockedGit.rebase('master')).never();
                verify(mockedGit.push('my-repo', 'master', false)).once();
                done();
            })
            .catch((error) => done(error));
    });

    it("disallow merging into the same branch", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        const context = {logger: instance(mockedLogger), branch: {name: 'master'}};
        await performBackmerge(instance(mockedGit), {branchName: 'master', allowSameBranchMerge: false}, context);
        verify(mockedLogger.error(anyString())).once();
    });

    it("works with template in branch name", (done) => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles()).thenResolve([]);
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};
        performBackmerge(instance(mockedGit), {branchName: '${branch.name}', allowSameBranchMerge: true}, context)
            .then(() => {
                verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "master".')).once();
                verify(mockedGit.configFetchAllRemotes()).once();
                verify(mockedGit.fetch(context.options.repositoryUrl)).once();
                verify(mockedGit.checkout('master')).once();
                verify(mockedGit.rebase('master')).never();
                verify(mockedGit.push('my-repo', 'master', false)).once();
                done();
            })
            .catch((error) => done(error));
    });

    it("works without plugin definition", (done) => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles()).thenResolve([]);
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};
        performBackmerge(instance(mockedGit), {branchName: 'develop'}, context)
            .then(() => {
                verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
                verify(mockedGit.checkout('master')).once();
                verify(mockedGit.configFetchAllRemotes()).once();
                verify(mockedGit.fetch(context.options.repositoryUrl)).once();
                verify(mockedGit.checkout('develop')).once();
                verify(mockedGit.rebase('master')).once();
                verify(mockedGit.push('my-repo', 'develop', false)).once();
                done();
            })
            .catch((error) => done(error));
    });

    it("with force-push", (done) => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles()).thenResolve([]);
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};
        performBackmerge(instance(mockedGit), {branchName: 'develop', forcePush: true}, context)
            .then(() => {
                verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
                verify(mockedGit.checkout('master')).once();
                verify(mockedGit.configFetchAllRemotes()).once();
                verify(mockedGit.fetch(context.options.repositoryUrl)).once();
                verify(mockedGit.checkout('develop')).once();
                verify(mockedGit.rebase('master')).once();
                verify(mockedGit.push('my-repo', 'develop', true)).once();
                done();
            })
            .catch((error) => done(error));
    });

    it("if files were changed a commit will be created", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve(['A    file-changed-by-plugin.md'])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                message: 'my-commit-message'
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();
        verify(mockedGit.checkout('develop')).once();
        verify(mockedGit.rebase('master')).once();
        verify(mockedGit.commit('my-commit-message')).once();
        verify(mockedGit.push('my-repo', 'develop', false)).once();
    });

    it("stash and unstash", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve([])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.rebase(anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                clearWorkspace: true,
                restoreWorkspace: true
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();

        const checkoutDevelopAction = mockedGit.checkout('develop');
        verify(mockedGit.stash()).calledBefore(checkoutDevelopAction);
        verify(checkoutDevelopAction).once();
        verify(mockedGit.rebase('master')).once();

        const pushAction = mockedGit.push('my-repo', 'develop', false)
        verify(pushAction).once();
        verify(mockedGit.unstash()).calledAfter(pushAction);
    });

    it("merge as backmerge strategy", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve([])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.merge(anyString(), anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                backmergeStrategy: 'merge'
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();

        verify(mockedGit.checkout('develop')).once();
        verify(mockedGit.merge('master', 'none')).once();

        verify(mockedGit.push('my-repo', 'develop', false)).once();
    });

    it("checkout mode ours", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve([])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.merge(anyString(), anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                backmergeStrategy: 'merge',
                mergeMode: 'ours'
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();

        verify(mockedGit.checkout('develop')).once();
        verify(mockedGit.merge('master', 'ours')).once();

        verify(mockedGit.push('my-repo', 'develop', false)).once();
    });

    it("merge mode theirs", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve([])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.merge(anyString(), anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                backmergeStrategy: 'merge',
                mergeMode: 'theirs'
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();

        verify(mockedGit.checkout('develop')).once();
        verify(mockedGit.merge('master', 'theirs')).once();

        verify(mockedGit.push('my-repo', 'develop', false)).once();
    });

    it("merge mode ours", async () => {
        const mockedGit = mock(Git);
        const mockedLogger = mock(NullLogger);
        when(mockedGit.checkout(anyString())).thenResolve();
        when(mockedGit.configFetchAllRemotes()).thenResolve();
        when(mockedGit.getStagedFiles())
            .thenReturn(new Promise<string[]>(resolve => resolve([])));
        when(mockedGit.fetch()).thenResolve();
        when(mockedGit.commit(anyString())).thenResolve();
        when(mockedGit.merge(anyString(), anyString())).thenResolve();
        when(mockedGit.push(anyString(), anyString(), anything())).thenResolve();

        const context = {logger: instance(mockedLogger), branch: {name: 'master'}, options: {repositoryUrl: 'my-repo'}};

        await performBackmerge(
            instance(mockedGit),
            {
                branchName: 'develop',
                backmergeStrategy: 'merge',
                mergeMode: 'ours'
            },
            context
        );
        verify(mockedLogger.log('Release succeeded. Performing back-merge into branch "develop".')).once();
        verify(mockedGit.checkout('master')).once();
        verify(mockedGit.configFetchAllRemotes()).once();
        verify(mockedGit.fetch(context.options.repositoryUrl)).once();

        verify(mockedGit.checkout('develop')).once();
        verify(mockedGit.merge('master', 'ours')).once();

        verify(mockedGit.push('my-repo', 'develop', false)).once();
    });
});
